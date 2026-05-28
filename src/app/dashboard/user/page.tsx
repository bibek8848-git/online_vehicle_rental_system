'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ShieldCheck, Wallet, Car, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserDashboard() {
  const [stats, setStats] = useState({
    activeBookings: 0,
    kycStatus: 'NOT UPLOADED',
    totalSpent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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

        const responses = [bookingsRes, kycRes, paymentsRes];
        for (const res of responses) {
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Received non-JSON response from ${res.url}`);
          }
        }
        
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
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back! Here's what's happening with your rentals.</p>
        </div>
        <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/dashboard/user/vehicles">
            <Car className="mr-2 h-5 w-5" />
            Book a Vehicle
          </Link>
        </Button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Bookings */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase text-xs tracking-wider">Active Bookings</CardDescription>
            <CardTitle className="text-4xl">
              {isLoading ? <Skeleton className="h-10 w-12" /> : stats.activeBookings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/user/bookings" className="flex items-center text-sm font-bold text-primary hover:underline">
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
            <CardDescription className="font-semibold uppercase text-xs tracking-wider">Verification Status</CardDescription>
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
                  ) : stats.kycStatus === 'REJECTED' ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-500">Rejected</span>
                    </>
                  ) : stats.kycStatus === 'PENDING' ? (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-500">Pending</span>
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
            <Link href="/dashboard/user/kyc" className="flex items-center text-sm font-bold text-primary hover:underline">
              {stats.kycStatus === 'APPROVED' ? 'View Details' : 'Verify Identity'} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase text-xs tracking-wider">Total Investment</CardDescription>
            <CardTitle className="text-4xl text-green-600">
              {isLoading ? <Skeleton className="h-10 w-48" /> : `Rs. ${stats.totalSpent.toLocaleString()}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/user/payments" className="flex items-center text-sm font-bold text-primary hover:underline">
              View Payment History <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Follow these steps to get the most out of Secure Drives.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { title: "Complete Verification", desc: "Upload your documents to become a verified member.", icon: ShieldCheck, status: stats.kycStatus === 'APPROVED' ? 'Done' : 'Pending' },
              { title: "Browse & Book", desc: "Choose from our wide selection of vehicles.", icon: Car, status: 'Ready' },
              { title: "Secure Payment", desc: "Use our integrated eSewa system for fast and safe transactions.", icon: Wallet, status: 'Active' }
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${step.status === 'Done' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                  {step.status}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-white">Need help?</CardTitle>
            <CardDescription className="text-primary-foreground/80">Our support team is here for you 24/7.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">If you encounter any issues with your booking or have questions about our services, don't hesitate to reach out.</p>
            <Button asChild variant="secondary" className="w-full font-bold">
              <Link href="/support">Contact Support</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 font-bold">
              <Link href="/faqs">Read FAQs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
