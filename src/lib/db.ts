// src/lib/db.ts
import { Pool } from 'pg';
import { config } from '@/lib/config';
import bcrypt from 'bcrypt';

const globalPg = globalThis as unknown as { pgPool?: Pool, tablesEnsured?: boolean };

export const pgPool =
    globalPg.pgPool ||
    new Pool({
        connectionString: config.database.dbUrl,
        ssl: { rejectUnauthorized: false },
    });

if (process.env.NODE_ENV !== 'production') globalPg.pgPool = pgPool;

export async function ensureTablesExist() {
    if (globalPg.tablesEnsured) return;

    try {
        await pgPool.query(`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          role TEXT NOT NULL DEFAULT 'USER',
          profile_picture TEXT,
          kyc_status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
          kyc_rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS kyc_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          document_type TEXT NOT NULL, -- Citizenship, License, Business Registration
          document_url TEXT,
          document_data BYTEA,
          status TEXT DEFAULT 'PENDING',
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS vehicles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
          make TEXT NOT NULL,
          model TEXT NOT NULL,
          year INTEGER NOT NULL,
          registration_number TEXT UNIQUE NOT NULL,
          price_per_day DECIMAL(10, 2) NOT NULL,
          description TEXT,
          images TEXT[], -- Array of image URLs
          is_approved BOOLEAN DEFAULT FALSE,
          rejection_reason TEXT,
          is_available BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
          payment_status TEXT DEFAULT 'UNPAID', -- UNPAID, PAID, REFUNDED
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          transaction_id TEXT UNIQUE, -- eSewa transaction ID
          payment_method TEXT DEFAULT 'ESEWA',
          status TEXT DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          type TEXT, -- KYC, BOOKING, PAYMENT, SYSTEM
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error: any) {
        if (error.code === '42804') {
            console.warn('Database schema mismatch detected (integer vs UUID). Attempting to fix by dropping and recreating tables...');
            try {
                await pgPool.query('DROP TABLE IF EXISTS users CASCADE;');
                // Recursive call to recreate tables after dropping
                return await ensureTablesExist();
            } catch (dropError) {
                console.error('Failed to drop tables automatically:', dropError);
                throw error;
            }
        }
        throw error;
    }

    // Seed Admin user
    const adminEmail = config.admin.email || 'admin@example.com';
    const adminPassword = config.admin.password || 'adminpassword123';
    
    const adminResult = await pgPool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (adminResult.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await pgPool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
            ['Admin User', adminEmail, hashedPassword, 'ADMIN']
        );
        console.log('Admin user seeded');
    } else {
        const admin = adminResult.rows[0];
        // Ensure admin has correct role and check if password needs update (optional, but let's at least fix the role)
        if (admin.role !== 'ADMIN') {
            await pgPool.query('UPDATE users SET role = $1 WHERE email = $2', ['ADMIN', adminEmail]);
            console.log('Admin role updated to uppercase');
        }
    }

    // Clean up any other inconsistent roles in the database
    await pgPool.query("UPDATE users SET role = 'USER' WHERE role = 'User'");
    await pgPool.query("UPDATE users SET role = 'PROVIDER' WHERE role = 'Provider'");

    globalPg.tablesEnsured = true;
}
