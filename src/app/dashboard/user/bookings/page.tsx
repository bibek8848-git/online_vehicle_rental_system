'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const data = await res.json();
        if (data.success) {
          setBookings(data.data);
        } else {
          toast.error(data.message || "Failed to fetch bookings");
        }
      } catch (error) {
        console.error("Fetch bookings error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const handlePayment = (bookingId: number) => {
    window.location.href = `/dashboard/user/payments/${bookingId}`;
  };

  const handleCancel = async (bookingId: number) => {
    setCancellingBooking(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ booking_id: bookingId })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response from server');
      }

      const data = await res.json();
      if (data.success) {
        setBookings((prev: any[]) => prev.filter((booking: any) => booking.id !== bookingId));
        toast.success(data.message || 'Booking request cancelled successfully');
      } else {
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(null);
    }
  };

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const status = searchParams.get('status');
    if (status === 'success') {
      toast.success('Payment successful! Your booking is confirmed.');
    } else if (status === 'failed') {
      toast.error('Payment failed. Please try again.');
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/6" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {bookings.length > 0 ? bookings.map((booking: any) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {booking.images && booking.images.length > 0 && booking.images[0] && booking.images[0].trim() !== '' && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img className="h-10 w-10 rounded-md object-cover" src={booking.images[0]} alt="" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.make} {booking.model}</div>
                        <div className="text-xs text-gray-500">{booking.registration_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Rs. {booking.total_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-y-2">
                    {booking.status === 'APPROVED' && booking.payment_status === 'UNPAID' && (
                      <button 
                        onClick={() => handlePayment(booking.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                      >
                        Pay with eSewa
                      </button>
                    )}
                    {booking.status === 'PENDING' && (
                      <button
                        disabled={cancellingBooking === booking.id}
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">You have no bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
