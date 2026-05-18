'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, Mail, Shield, Calendar, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (!token) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const res = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.data);
                setName(data.data.name);
                setAvatar(data.data.avatar || '');
                setPreviewUrl(data.data.avatar || '');
            } else {
                toast.error(data.message || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            if (typeof window !== 'undefined') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const formData = new FormData();
            formData.append('name', name);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated successfully!');
                const updatedAvatar = data.user.avatar;
                setUser({ ...user, name, avatar: updatedAvatar });
                setAvatar(updatedAvatar || '');
                setPreviewUrl(updatedAvatar || '');
                setAvatarFile(null);
                
                // Update localStorage
                if (typeof window !== 'undefined') {
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = { ...storedUser, name, avatar: updatedAvatar };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    // Update cookies for middleware if possible (client-side update is limited)
                    document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=3600; SameSite=Lax`;
                }
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'PROVIDER' ? '/dashboard/provider' : '/dashboard/user'}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                            <p className="text-muted-foreground">Manage your personal information and preferences.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden">
                            <div className="h-24 bg-primary/10 w-full" />
                            <CardContent className="relative pt-12 pb-6 text-center">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="relative group">
                                        <div className="h-24 w-24 rounded-2xl bg-card border-4 border-background shadow-xl overflow-hidden flex items-center justify-center">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-12 w-12 text-muted-foreground opacity-50" />
                                            )}
                                        </div>
                                        <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 h-8 w-8 rounded-lg bg-primary text-primary-foreground shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                                            <Camera className="h-4 w-4" />
                                            <input 
                                                id="avatar-upload" 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold">{user.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider font-semibold">{user.role}</p>
                                
                                <div className="flex flex-col gap-2 text-left bg-muted/30 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Shield className={`h-4 w-4 ${user.kyc_status === 'APPROVED' ? 'text-green-500' : 'text-yellow-500'}`} />
                                        <span className="font-medium">KYC: {user.kyc_status}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleUpdateProfile}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your profile name and photo.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    id="email" 
                                                    value={user.email} 
                                                    disabled 
                                                    className="pl-10 bg-muted/50 opacity-70 cursor-not-allowed" 
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Email address cannot be changed.</p>
                                        </div>
                                        
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    id="name" 
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Your name"
                                                    className="pl-10 h-12 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="avatar-file">Profile Picture</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden flex items-center justify-center border">
                                                    {previewUrl ? (
                                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-8 w-8 text-muted-foreground/50" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Input 
                                                        id="avatar-file" 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="cursor-pointer"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">Upload a professional photo. JPG, PNG or GIF. Max 2MB.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-muted/20 p-6 flex justify-end">
                                    <Button type="submit" size="lg" disabled={isSaving} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-5 w-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>
                </div>
            </main>

        </div>
    );
}
