'use client';

import Header from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white dark:bg-gray-800 border-r min-h-[calc(100-64px)] hidden md:block">
                    <nav className="p-4 space-y-2">
                        <a href="/dashboard/admin" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Dashboard</a>
                        <a href="/dashboard/admin/users" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Users</a>
                        <a href="/dashboard/admin/providers" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Providers</a>
                        <a href="/dashboard/admin/kyc" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">KYC Verification</a>
                        <a href="/dashboard/admin/vehicles" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Vehicles</a>
                        <a href="/dashboard/admin/bookings" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Bookings</a>
                        <a href="/dashboard/admin/payments" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Payments</a>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
            <footer className="bg-white dark:bg-gray-800 border-t py-4 text-center text-sm text-gray-500">
                Secure Drives © 2025 – Admin Panel
            </footer>
        </div>
    );
}
