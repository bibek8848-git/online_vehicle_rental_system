'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/user/vehicles/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setVehicle(data.data);
        }
      } catch (error) {
        console.error("Fetch vehicle error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicle();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsBooking(true);

    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      setIsBooking(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = diffDays * vehicle.price_per_day;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: id,
          startDate,
          endDate,
          totalPrice
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Booking request sent successfully!');
        setTimeout(() => router.push('/dashboard/user/bookings'), 2000);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading vehicle details...</div>;
  if (!vehicle) return <div className="text-center py-12">Vehicle not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
            {vehicle.images && vehicle.images[0] && vehicle.images[0].trim() !== '' ? (
              <img src={vehicle.images[0]} alt={vehicle.make} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {vehicle.images?.slice(1).filter((img: string) => img.trim() !== '').map((img: string, index: number) => (
              <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                <img src={img} alt={`${vehicle.make} ${index}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info & Booking Form */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</h1>
            <p className="text-xl font-semibold text-blue-600 mt-2">Rs. {vehicle.price_per_day} / day</p>
          </div>

          <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-400">
            <p>{vehicle.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              <span className="block text-gray-500">Year</span>
              <span className="font-semibold">{vehicle.year}</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              <span className="block text-gray-500">Registration</span>
              <span className="font-semibold">{vehicle.registration_number}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4">Book this Vehicle</h3>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-500 p-3 rounded mb-4 text-sm">{success}</div>}
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full text-sm border rounded p-2 bg-transparent"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full text-sm border rounded p-2 bg-transparent"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isBooking}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Request Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
