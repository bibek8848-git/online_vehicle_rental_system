'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading stats...</div>;

    const statCards = [
        { title: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-600" },
        { title: "Total Providers", value: stats?.totalProviders || 0, color: "text-green-600" },
        { title: "Total Bookings", value: stats?.totalBookings || 0, color: "text-purple-600" },
        { title: "Total Revenue", value: `Rs. ${stats?.totalRevenue?.toFixed(2) || '0.00'}`, color: "text-orange-600" },
        { title: "Pending KYC", value: stats?.pendingKyc || 0, color: "text-red-600" },
        { title: "Pending Vehicles", value: stats?.pendingVehicles || 0, color: "text-amber-600" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <a href="/dashboard/admin/kyc" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Review KYC</a>
                    <a href="/dashboard/admin/vehicles" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">Approve Vehicles</a>
                    <a href="/dashboard/admin/bookings" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">View Bookings</a>
                </div>
            </div>
        </div>
    );
}
