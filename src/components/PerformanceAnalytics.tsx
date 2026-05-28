'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
    TrendingUp, Users, Calendar, CheckCircle2, XCircle, 
    DollarSign, Star, Award, AlertCircle, Filter, Download 
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PerformanceAnalytics() {
    const [range, setRange] = useState('30days');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/provider/analytics?range=${range}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to load analytics data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                    <p className="text-destructive font-medium">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchAnalytics}>Try Again</Button>
                </CardContent>
            </Card>
        );
    }

    const summary = data?.summary || {};
    const topVehicle = data?.topVehicle;

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4 bg-muted p-1 rounded-lg">
                {[
                    { label: '7 Days', value: '7days' },
                    { label: '30 Days', value: '30days' },
                    { label: '6 Months', value: '6months' }
                ].map((r) => (
                    <Button 
                        key={r.value}
                        variant={range === r.value ? "secondary" : "ghost"} 
                        size="sm"
                        className={range === r.value ? "bg-background shadow-sm" : ""}
                        onClick={() => setRange(r.value)}
                    >
                        {r.label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Bookings" 
                    value={summary.total_bookings} 
                    icon={Calendar} 
                    loading={isLoading} 
                />
                <StatCard 
                    title="Active Rentals" 
                    value={summary.active_rentals} 
                    icon={TrendingUp} 
                    color="text-blue-600"
                    loading={isLoading} 
                />
                <StatCard 
                    title="Completed" 
                    value={summary.completed_rentals} 
                    icon={CheckCircle2} 
                    color="text-green-600"
                    loading={isLoading} 
                />
                <StatCard 
                    title="Cancelled" 
                    value={summary.cancelled_bookings} 
                    icon={XCircle} 
                    color="text-red-600"
                    loading={isLoading} 
                />
                <StatCard 
                    title="Total Earnings" 
                    value={`Rs. ${Number(summary.total_earnings).toLocaleString()}`} 
                    icon={DollarSign} 
                    loading={isLoading} 
                />
                <StatCard 
                    title="Monthly Earnings" 
                    value={`Rs. ${Number(summary.monthly_earnings).toLocaleString()}`} 
                    icon={TrendingUp} 
                    color="text-green-600"
                    loading={isLoading} 
                />
                <StatCard 
                    title="Avg Rating" 
                    value={summary.average_rating ? Number(summary.average_rating).toFixed(1) : 'N/A'} 
                    icon={Star} 
                    color="text-yellow-500"
                    loading={isLoading} 
                />
                <StatCard 
                    title="Top Vehicle" 
                    value={topVehicle ? `${topVehicle.make} ${topVehicle.model}` : 'N/A'} 
                    icon={Award} 
                    color="text-purple-600"
                    loading={isLoading} 
                    description={topVehicle ? `${topVehicle.booking_count} bookings` : ''}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : data?.monthlyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(val) => `Rs.${val}`} />
                                    <Tooltip 
                                        formatter={(val) => [`Rs. ${Number(val).toLocaleString()}`, 'Revenue']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3} 
                                        dot={{ r: 4, fill: '#3b82f6' }} 
                                        activeDot={{ r: 6 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No revenue data available" />
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Bookings Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Booking Volume</CardTitle>
                        <CardDescription>Number of bookings per month</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : data?.monthlyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No booking data available" />
                        )}
                    </CardContent>
                </Card>

                {/* Most Booked Vehicles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Top 5 Vehicles</CardTitle>
                        <CardDescription>Most booked vehicles in the selected range</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : data?.mostBooked.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.mostBooked}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.mostBooked.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No vehicle data available" />
                        )}
                    </CardContent>
                </Card>

                {/* Vehicle Availability */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Fleet Status</CardTitle>
                        <CardDescription>Availability of your vehicles</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : data?.availability.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.availability.map((a: any) => ({
                                            name: a.is_available ? 'Available' : 'Unavailable',
                                            value: parseInt(a.count)
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No availability data available" />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color = "text-primary", loading, description }: any) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-20" /> : value}
                </div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}
