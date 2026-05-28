'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Car, Calendar, ShieldCheck, ArrowRight, BarChart3, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';

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
                fetch('/api/provider/kyc', { headers: { 'Authorization': `Bearer ${token}` } }) 
            ]);

            const vData = await vRes.json();
            const bData = await bRes.json();
            const uData = await uRes.json();

            if (vData.success && bData.success) {
                setStats({
                    totalVehicles: vData.data.length,
                    pendingApprovals: vData.data.filter((v: any) => !v.is_approved).length,
                    activeBookings: bData.data.filter((b: any) => b.status === 'APPROVED' || b.status === 'PENDING').length,
                    kycStatus: uData.data?.status || 'NOT UPLOADED'
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
                        <p className="text-muted-foreground mt-1 text-lg">Manage your fleet and track your earnings.</p>
                    </div>
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                        <Link href="/dashboard/provider/vehicles/add">
                            <Plus className="mr-2 h-5 w-5" />
                            Add New Vehicle
                        </Link>
                    </Button>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Vehicles */}
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <Car className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Total Fleet</CardDescription>
                            <CardTitle className="text-4xl">
                                {isLoading ? <Skeleton className="h-10 w-12" /> : stats.totalVehicles}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/provider/vehicles" className="flex items-center text-sm font-bold text-primary hover:underline">
                                View Fleet <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Pending Approvals */}
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <AlertCircle className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Waiting for Admin</CardDescription>
                            <CardTitle className="text-4xl text-yellow-500">
                                {isLoading ? <Skeleton className="h-10 w-12" /> : stats.pendingApprovals}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">Vehicles needing approval</span>
                        </CardContent>
                    </Card>

                    {/* Active Bookings */}
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <Calendar className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Active Rentals</CardDescription>
                            <CardTitle className="text-4xl text-blue-600">
                                {isLoading ? <Skeleton className="h-10 w-12" /> : stats.activeBookings}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/provider/bookings" className="flex items-center text-sm font-bold text-primary hover:underline">
                                Manage Bookings <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* KYC Status */}
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Business Status</CardDescription>
                            <CardTitle className="text-2xl">
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {stats.kycStatus === 'APPROVED' ? (
                                            <>
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <span className="text-green-500">Verified</span>
                                            </>
                                        ) : stats.kycStatus === 'PENDING' ? (
                                            <>
                                                <Clock className="h-5 w-5 text-yellow-500" />
                                                <span className="text-yellow-500">Pending</span>
                                            </>
                                        ) : stats.kycStatus === 'REJECTED' ? (
                                            <>
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                                <span className="text-red-500">Rejected</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-5 w-5 text-gray-500" />
                                                <span className="text-gray-500">Not Uploaded</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/provider/kyc" className="flex items-center text-sm font-bold text-primary hover:underline">
                                Update KYC <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl">Fleet Performance</CardTitle>
                            <CardDescription>Comprehensive analytics of your rental business.</CardDescription>
                        </CardHeader>
                        <PerformanceAnalytics />
                    </div>
                    
                    <Card className="bg-primary text-primary-foreground relative h-fit overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <CardHeader>
                            <CardTitle className="text-white">Provider Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                                <p className="text-sm">Approval typically takes 24-48 hours after vehicle submission.</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                                <p className="text-sm">High-quality photos increase booking rates by up to 40%.</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                                <p className="text-sm">Keep your calendar up to date to avoid booking cancellations.</p>
                            </div>
                            <Button asChild variant="secondary" className="w-full mt-4 font-bold">
                                <Link href="/dashboard/provider/guidelines">View Full Guide</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <footer className="mt-20 py-10 border-t bg-muted/30 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                        <Car className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold tracking-tight">Secure Drives</span>
                </div>
                <p className="text-sm text-muted-foreground">© 2026 Secure Drives Provider Portal. All rights reserved.</p>
            </footer>
        </div>
    );
}
