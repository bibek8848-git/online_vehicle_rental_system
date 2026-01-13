'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useParams } from 'next/navigation';

export default function EditVehicle() {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        registration_number: '',
        price_per_day: '',
        description: '',
        images: [''],
        is_available: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            fetchVehicle();
        }
    }, [id]);

    const fetchVehicle = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/provider/vehicles/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const vehicle = data.data;
                setFormData({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    registration_number: vehicle.registration_number,
                    price_per_day: vehicle.price_per_day.toString(),
                    description: vehicle.description || '',
                    images: vehicle.images && vehicle.images.length > 0 ? vehicle.images : [''],
                    is_available: vehicle.is_available
                });
            } else {
                alert(data.message);
                router.push('/dashboard/provider/vehicles');
            }
        } catch (error) {
            console.error('Error fetching vehicle:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/provider/vehicles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price_per_day: parseFloat(formData.price_per_day),
                    year: parseInt(formData.year.toString())
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Vehicle updated successfully and pending admin approval.');
                router.push('/dashboard/provider/vehicles');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating vehicle:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />
            <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Edit Vehicle</h1>
                
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="make">Make</Label>
                            <Input id="make" name="make" placeholder="e.g. Toyota" required value={formData.make} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model</Label>
                            <Input id="model" name="model" placeholder="e.g. Corolla" required value={formData.model} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input id="year" name="year" type="number" required value={formData.year} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="registration_number">Registration Number</Label>
                            <Input id="registration_number" name="registration_number" placeholder="e.g. BA-1-PA-1234" required value={formData.registration_number} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price_per_day">Price Per Day (Rs.)</Label>
                            <Input id="price_per_day" name="price_per_day" type="number" step="0.01" required value={formData.price_per_day} onChange={handleChange} />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <input 
                                id="is_available" 
                                name="is_available" 
                                type="checkbox" 
                                checked={formData.is_available} 
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <Label htmlFor="is_available">Available for Rent</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Vehicle features, condition, etc." value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="space-y-4">
                        <Label>Vehicle Images (URLs)</Label>
                        {formData.images.map((img, index) => (
                            <Input 
                                key={index} 
                                placeholder="https://example.com/image.jpg" 
                                value={img} 
                                onChange={(e) => handleImageChange(index, e.target.value)} 
                            />
                        ))}
                        <Button type="button" variant="outline" onClick={addImageField}>Add Another Image URL</Button>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </main>
            <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500">
                Secure Drives © 2025
            </footer>
        </div>
    );
}
