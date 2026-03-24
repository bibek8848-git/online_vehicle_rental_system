'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12 items-center">
            <div className="flex space-x-8">
              <Link href="/dashboard/user" className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                Secure Drives
              </Link>
              <Link href="/dashboard/user/vehicles" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-1 pt-1 text-sm font-medium">
                Browse Vehicles
              </Link>
              <Link href="/dashboard/user/bookings" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-1 pt-1 text-sm font-medium">
                My Bookings
              </Link>
              <Link href="/dashboard/user/kyc" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-1 pt-1 text-sm font-medium">
                KYC
              </Link>
              <Link href="/dashboard/user/payments" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-1 pt-1 text-sm font-medium">
                Payments
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-bold text-blue-600">Secure Drives</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            &copy; 2025 Secure Drives. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
