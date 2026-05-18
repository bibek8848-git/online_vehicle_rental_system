'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

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
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
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
                    images: vehicle.images && vehicle.images.length > 0 ? vehicle.images : [],
                    is_available: vehicle.is_available
                });
                setExistingImages(vehicle.images || []);
            } else {
                toast.error(data.message);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);
            
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removeNewImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (existingImages.length === 0 && images.length === 0) {
            toast.error('Please provide at least one image.');
            return;
        }

        setIsSaving(true);

        try {
            const token = localStorage.getItem('token');

            // Upload new images
            const uploadedImageUrls: string[] = [];
            for (const image of images) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', image);
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    uploadedImageUrls.push(uploadData.url);
                }
            }

            const allImages = [...existingImages, ...uploadedImageUrls];

            const res = await fetch(`/api/provider/vehicles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    images: allImages,
                    price_per_day: parseFloat(formData.price_per_day),
                    year: parseInt(formData.year.toString())
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Vehicle updated successfully and pending admin approval.');
                router.push('/dashboard/provider/vehicles');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error updating vehicle:', error);
            toast.error('An error occurred. Please try again.');
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
                        <Label>Vehicle Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Existing Images */}
                            {existingImages.map((url, index) => (
                                <div key={`existing-${index}`} className="relative aspect-video rounded-lg overflow-hidden group">
                                    <img src={url} alt={`Existing ${index}`} className="object-cover w-full h-full" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {/* New Previews */}
                            {previewUrls.map((url, index) => (
                                <div key={`new-${index}`} className="relative aspect-video rounded-lg overflow-hidden group">
                                    <img src={url} alt={`New Preview ${index}`} className="object-cover w-full h-full border-2 border-blue-500" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center p-4 hover:border-blue-500 transition-colors cursor-pointer aspect-video">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                            </label>
                        </div>
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
