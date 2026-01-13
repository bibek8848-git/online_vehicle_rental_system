'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/user/vehicles?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error("Fetch vehicles error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Vehicles</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input 
            type="text" 
            placeholder="Search by name/type" 
            className="w-full text-sm border rounded p-2 bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min Price</label>
          <input 
            type="number" 
            placeholder="Min Price" 
            className="w-full text-sm border rounded p-2 bg-transparent"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max Price</label>
          <input 
            type="number" 
            placeholder="Max Price" 
            className="w-full text-sm border rounded p-2 bg-transparent"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full text-sm border rounded p-2 bg-transparent"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input 
            type="date" 
            className="w-full text-sm border rounded p-2 bg-transparent"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={fetchVehicles}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading vehicles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length > 0 ? vehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
                {vehicle.images && vehicle.images[0] ? (
                  <img src={vehicle.images[0]} alt={vehicle.make} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Rs. {vehicle.price_per_day}/day
                </div>
              </div>
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{vehicle.description}</p>
                <div className="flex items-center mt-3 text-xs text-gray-500">
                  <span className="mr-3">Year: {vehicle.year}</span>
                  <span>Reg: {vehicle.registration_number}</span>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <Link 
                  href={`/dashboard/user/vehicles/${vehicle.id}`}
                  className="block w-full text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-gray-500">No vehicles found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}
