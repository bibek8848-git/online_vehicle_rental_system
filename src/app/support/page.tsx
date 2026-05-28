'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, LifeBuoy, ArrowLeft, Phone } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contact Support</h1>
                        <p className="text-muted-foreground mt-2 text-lg">Need help? Our team is ready to assist with any booking, payment, or account issue.</p>
                    </div>
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                        <Link href="/dashboard/user">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <Card className="space-y-6 p-6">
                    <CardHeader className="p-0">
                        <CardTitle>Support Options</CardTitle>
                        <CardDescription>Choose the fastest way to reach us.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="rounded-2xl border border-muted/50 bg-muted/30 p-5">
                            <div className="flex items-center gap-4 mb-3">
                                <Mail className="h-6 w-6 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Email Support</h3>
                                    <p className="text-sm text-muted-foreground">support@securedrives.com</p>
                                </div>
                            </div>
                            <Button asChild variant="secondary" className="mt-2">
                                <a href="mailto:support@securedrives.com">Send Email</a>
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-muted/50 bg-muted/30 p-5">
                            <div className="flex items-center gap-4 mb-3">
                                <Phone className="h-6 w-6 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Phone Support</h3>
                                    <p className="text-sm text-muted-foreground">Call us at +977 980-000-0000</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-muted/50 bg-muted/30 p-5">
                            <div className="flex items-center gap-4 mb-3">
                                <LifeBuoy className="h-6 w-6 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Hours</h3>
                                    <p className="text-sm text-muted-foreground">Available 24/7 for urgent account and booking help.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
