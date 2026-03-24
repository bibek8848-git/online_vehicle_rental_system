'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/user/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          const foundBooking = data.data.find((b: any) => b.id.toString() === bookingId);
          if (foundBooking) {
            setBooking(foundBooking);
          } else {
            alert('Booking not found');
            router.push('/dashboard/user/bookings');
          }
        }
      } catch (error) {
        console.error("Fetch booking error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookingDetails();
  }, [bookingId, router]);

  const handleEsewaPayment = async () => {
    if (!booking) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/payments/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.total_price
        })
      });

      const data = await res.json();
      if (data.success) {
        // Create a form dynamically and submit it to eSewa
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', data.data.esewa_url);

        for (const key in data.data) {
          if (key !== 'esewa_url') {
            const hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', data.data[key]);
            form.appendChild(hiddenField);
          }
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.message || "Failed to initiate payment.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred during payment initiation.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-medium">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Booking not found</h2>
        <button 
          onClick={() => router.push('/dashboard/user/bookings')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Payment Confirmation</h1>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {booking.make} {booking.model}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Registration: {booking.registration_number}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
              </p>
            </div>
            {booking.images && booking.images.length > 0 && (
              <img 
                src={booking.images[0]} 
                alt={booking.make} 
                className="w-24 h-16 object-cover rounded-md"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Rental Charge</span>
              <span>Rs. {booking.total_price}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Service Fee</span>
              <span>Rs. 0</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
              <span>Total Amount</span>
              <span>Rs. {booking.total_price}</span>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Select Payment Method</h3>
            
            <button
              onClick={handleEsewaPayment}
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#41a124] hover:bg-[#388e1e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41a124] transition-colors ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <img src="https://blog.esewa.com.np/wp-content/uploads/2021/01/esewa_logo.png" alt="eSewa" className="h-8 bg-white px-2 py-0.5 rounded" />
                  Pay with eSewa
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-center text-gray-500">
              You will be redirected to eSewa's secure payment gateway to complete your transaction.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button 
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}
