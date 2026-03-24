'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const [stats, setStats] = useState({
    activeBookings: 0,
    kycStatus: 'PENDING',
    totalSpent: 0
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem('token');
        const [bookingsRes, kycRes, paymentsRes] = await Promise.all([
          fetch('/api/user/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/user/kyc', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/user/payments', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        const bookingsData = await bookingsRes.json();
        const kycData = await kycRes.json();
        const paymentsData = await paymentsRes.json();

        if (bookingsData.success && kycData.success && paymentsData.success) {
          const totalSpent = paymentsData.data
            .filter((p: any) => p.status === 'SUCCESS')
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

          setStats({
            activeBookings: bookingsData.data.filter((b: any) => b.status === 'APPROVED' || b.status === 'PENDING').length,
            kycStatus: kycData.data.status,
            totalSpent
          });
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Bookings</h3>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.activeBookings}</p>
          <Link href="/dashboard/user/bookings" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
            View details →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">KYC Status</h3>
          <p className={`text-xl font-bold mt-1 ${
            stats.kycStatus === 'APPROVED' ? 'text-green-500' : 
            stats.kycStatus === 'REJECTED' ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {stats.kycStatus}
          </p>
          <Link href="/dashboard/user/kyc" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
            {stats.kycStatus === 'APPROVED' ? 'View details' : 'Complete KYC'} →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Browse Vehicles</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Find your next ride today!</p>
          <Link href="/dashboard/user/vehicles" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm mt-4 inline-block hover:bg-blue-700">
            Browse Now
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Spent</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">Rs. {stats.totalSpent}</p>
          <Link href="/dashboard/user/payments" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
            View history →
          </Link>
        </div>
      </div>
    </div>
  );
}
