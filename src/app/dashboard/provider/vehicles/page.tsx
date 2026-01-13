'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function MyVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/provider/vehicles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setVehicles(data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/provider/vehicles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setVehicles(vehicles.filter((v: any) => v.id !== id));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Vehicles</h1>
                    <Button onClick={() => router.push('/dashboard/provider/vehicles/add')}>Add Vehicle</Button>
                </div>

                {vehicles.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow">
                        <p className="text-gray-500 mb-4">You haven't added any vehicles yet.</p>
                        <Button onClick={() => router.push('/dashboard/provider/vehicles/add')}>Add Your First Vehicle</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((vehicle: any) => (
                            <Card key={vehicle.id} className="overflow-hidden">
                                <div className="aspect-video relative bg-gray-200">
                                    {vehicle.images?.[0] ? (
                                        <img src={vehicle.images[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                                        vehicle.is_approved ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                                    }`}>
                                        {vehicle.is_approved ? 'Approved' : 'Pending Approval'}
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle>{vehicle.make} {vehicle.model} ({vehicle.year})</CardTitle>
                                    <p className="text-sm text-gray-500">{vehicle.registration_number}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-blue-600">Rs. {vehicle.price_per_day} / day</span>
                                        <span className={`text-xs ${vehicle.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                            {vehicle.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => router.push(`/dashboard/provider/vehicles/edit/${vehicle.id}`)}>Edit</Button>
                                        <Button variant="destructive" className="flex-1" onClick={() => handleDelete(vehicle.id)}>Delete</Button>
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
