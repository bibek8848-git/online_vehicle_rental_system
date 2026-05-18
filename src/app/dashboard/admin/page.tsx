'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    UserCheck, 
    Calendar, 
    Wallet, 
    ShieldAlert, 
    Car, 
    ArrowRight,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';

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

    const statCards = [
        { title: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
        { title: "Total Providers", value: stats?.totalProviders, icon: UserCheck, color: "text-green-600", bg: "bg-green-500/10" },
        { title: "Total Bookings", value: stats?.totalBookings, icon: Calendar, color: "text-purple-600", bg: "bg-purple-500/10" },
        { title: "Total Revenue", value: stats?.totalRevenue !== undefined ? `Rs. ${stats?.totalRevenue?.toLocaleString()}` : undefined, icon: Wallet, color: "text-orange-600", bg: "bg-orange-500/10" },
        { title: "Pending KYC", value: stats?.pendingKyc, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-500/10" },
        { title: "Pending Vehicles", value: stats?.pendingVehicles, icon: Car, color: "text-amber-600", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Real-time overview of platform activity and growth.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="rounded-xl">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Reports
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <Card key={index} className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <card.icon className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-semibold uppercase text-xs tracking-wider">{card.title}</CardDescription>
                            <CardTitle className={`text-3xl ${card.color}`}>
                                {loading ? (
                                    <Skeleton className="h-10 w-24" />
                                ) : (
                                    card.value ?? 0
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <span className="text-green-500 flex items-center mr-1">
                                    <TrendingUp className="h-3 w-3 mr-1" /> +12%
                                </span> 
                                from last month
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Items requiring immediate attention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold">KYC Verifications</p>
                                    <p className="text-sm text-muted-foreground">{stats?.pendingKyc || 0} applications waiting</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                                <Link href="/dashboard/admin/kyc">Review <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Car className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold">Vehicle Listings</p>
                                    <p className="text-sm text-muted-foreground">{stats?.pendingVehicles || 0} listings to approve</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                                <Link href="/dashboard/admin/vehicles">Approve <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Platform Health</CardTitle>
                        <CardDescription>System performance and uptime.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-t bg-muted/20">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">System metrics are stable.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
