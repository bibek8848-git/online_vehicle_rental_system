'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddVehicle() {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        registration_number: '',
        price_per_day: '',
        description: '',
        images: ['']
    });
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);
            
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (images.length === 0) {
            toast.error('Please upload at least one vehicle image.');
            return;
        }

        if (parseInt(formData.year.toString()) < 1900 || parseInt(formData.year.toString()) > new Date().getFullYear() + 1) {
            toast.error('Please provide a valid year.');
            return;
        }

        if (parseFloat(formData.price_per_day) <= 0) {
            toast.error('Price per day must be greater than zero.');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Upload images first
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

            const res = await fetch('/api/provider/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    images: uploadedImageUrls,
                    price_per_day: parseFloat(formData.price_per_day),
                    year: parseInt(formData.year.toString())
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Vehicle added successfully and pending admin approval.');
                router.push('/dashboard/provider/vehicles');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />
            <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Add New Vehicle</h1>
                
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Vehicle features, condition, etc." value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="space-y-4">
                        <Label>Vehicle Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                                    <img src={url} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(index)}
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
                        <Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Vehicle'}</Button>
                    </div>
                </form>
            </main>
            <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500">
                Secure Drives © 2025
            </footer>
        </div>
    );
}
