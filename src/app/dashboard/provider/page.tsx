'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProviderDashboard() {
    const [stats, setStats] = useState({
        totalVehicles: 0,
        pendingApprovals: 0,
        activeBookings: 0,
        kycStatus: 'PENDING'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const [vRes, bRes, uRes] = await Promise.all([
                fetch('/api/provider/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/provider/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/user/kyc', { headers: { 'Authorization': `Bearer ${token}` } }) // Reusing user KYC for now as it's the same table
            ]);

            const vData = await vRes.json();
            const bData = await bRes.json();
            const uData = await uRes.json();

            if (vData.success && bData.success) {
                setStats({
                    totalVehicles: vData.data.length,
                    pendingApprovals: vData.data.filter((v: any) => !v.is_approved).length,
                    activeBookings: bData.data.filter((b: any) => b.status === 'APPROVED' || b.status === 'PENDING').length,
                    kycStatus: uData.data?.[0]?.status || 'NOT UPLOADED'
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Vehicles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending Approvals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.activeBookings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">KYC Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-xl font-bold ${
                                stats.kycStatus === 'APPROVED' ? 'text-green-600' : 
                                stats.kycStatus === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                                {stats.kycStatus}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <a href="/dashboard/provider/vehicles/add" className="w-full py-2 px-4 bg-blue-600 text-white text-center rounded hover:bg-blue-700">Add New Vehicle</a>
                            <a href="/dashboard/provider/bookings" className="w-full py-2 px-4 bg-white border border-gray-300 text-center rounded hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">Manage Bookings</a>
                            <a href="/dashboard/provider/kyc" className="w-full py-2 px-4 bg-white border border-gray-300 text-center rounded hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">Update KYC</a>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome, Provider!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                                Use the sidebar or quick actions to manage your fleet, check booking requests, and keep your business KYC up to date.
                                Remember, vehicles are only visible to customers once they are approved by an administrator.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500">
                Secure Drives © 2025
            </footer>
        </div>
    );
}
