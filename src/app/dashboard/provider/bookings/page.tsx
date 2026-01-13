'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/provider/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (bookingId: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this booking?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/provider/bookings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookingId, status })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Booking ${status.toLowerCase()}ed successfully.`);
                fetchBookings();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Booking Requests</h1>

                {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow">
                        <p className="text-gray-500">No booking requests found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking: any) => (
                            <Card key={booking.id}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle>{booking.make} {booking.model}</CardTitle>
                                        <p className="text-sm text-gray-500">Reg: {booking.registration_number}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {booking.status}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer Details</p>
                                            <p className="font-medium">{booking.customer_name}</p>
                                            <p className="text-sm">{booking.customer_email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rental Period</p>
                                            <p className="font-medium">
                                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm font-bold text-blue-600">Total: Rs. {booking.total_price}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(booking.id, 'APPROVED')}>Accept</Button>
                                                    <Button variant="destructive" className="flex-1" onClick={() => handleAction(booking.id, 'REJECTED')}>Reject</Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Booked on: {new Date(booking.created_at).toLocaleString()}</span>
                                        <span className={`text-xs font-bold ${booking.payment_status === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                                            Payment: {booking.payment_status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500">
                Secure Drives © 2025
            </footer>
        </div>
    );
}
