'use client';

import Header from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="p-8">
                {children}
            </main>
            <footer className="bg-white dark:bg-gray-800 border-t py-4 text-center text-sm text-gray-500">
                Secure Drives © 2025 – Admin Panel
            </footer>
        </div>
    );

}
