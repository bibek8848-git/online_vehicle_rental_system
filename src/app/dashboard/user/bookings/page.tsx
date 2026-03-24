'use client';

import { useEffect, useState } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.data);
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

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const status = searchParams.get('status');
    if (status === 'success') {
      alert('Payment successful! Your booking is confirmed.');
    } else if (status === 'failed') {
      alert('Payment failed. Please try again.');
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>

      {isLoading ? (
        <div className="text-center py-12">Loading bookings...</div>
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
                      booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {booking.status === 'APPROVED' && booking.payment_status === 'UNPAID' && (
                      <button 
                        onClick={() => handlePayment(booking.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                      >
                        Pay with eSewa
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
