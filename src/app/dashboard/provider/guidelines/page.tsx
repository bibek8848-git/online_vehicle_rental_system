'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, Camera, Calendar, CheckCircle2, Users } from 'lucide-react';

export default function ProviderGuidelinesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Provider Guidelines</h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Follow these best practices to keep your fleet approved, visible, and booking-ready.
                        </p>
                    </div>
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                        <Link href="/dashboard/provider">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Complete Provider Best Practices</CardTitle>
                        <CardDescription>
                            These guidelines help you maintain a trusted and profitable provider profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 p-4 rounded-2xl bg-muted/60 border border-muted/30">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Submit accurate information</h3>
                                <p className="text-sm text-muted-foreground">
                                    Provide complete vehicle details, accurate pricing, and honest availability to reduce cancellations and disputes.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-muted/60 border border-muted/30">
                            <Camera className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Use high-quality photos</h3>
                                <p className="text-sm text-muted-foreground">
                                    Add at least 5 clear photos showing the exterior, interior, and key features of your vehicle.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-muted/60 border border-muted/30">
                            <Calendar className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Keep availability up to date</h3>
                                <p className="text-sm text-muted-foreground">
                                    Update your calendar and blocked dates immediately to avoid double bookings and cancellations.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-muted/60 border border-muted/30">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Respond to rentals quickly</h3>
                                <p className="text-sm text-muted-foreground">
                                    Check booking requests often and reply on time to improve your approval rate and customer trust.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-muted/60 border border-muted/30">
                            <Users className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Maintain vehicle quality</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ensure your vehicle is clean, serviced, and fully documented before every rental.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-muted/30 p-4 bg-muted/60">
                            <h3 className="font-semibold">KYC and compliance</h3>
                            <p className="text-sm text-muted-foreground">
                                Keep your business documents and KYC status current. If your KYC is pending, upload the required documents right away.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
