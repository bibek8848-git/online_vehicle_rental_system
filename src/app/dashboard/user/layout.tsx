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
