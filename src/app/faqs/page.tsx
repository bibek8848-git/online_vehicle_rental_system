'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, ArrowLeft, Mail } from 'lucide-react';

export default function FaqsPage() {
    const faqs = [
        {
            question: 'How do I book a vehicle?',
            answer: 'Visit the Vehicles section, choose a rental, and complete the booking form with dates and payment details.',
        },
        {
            question: 'Can I cancel or reschedule a booking?',
            answer: 'Yes. Open your booking details under My Bookings and follow the cancellation or reschedule instructions.',
        },
        {
            question: 'How do I verify my account?',
            answer: 'Go to the KYC section, upload the required documents, and wait for admin approval.',
        },
        {
            question: 'What payment methods are available?',
            answer: 'We currently accept eSewa and other supported digital payments through the payment page.',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground mt-2 text-lg">Find answers to common questions about bookings, payments, verification, and more.</p>
                    </div>
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                        <Link href="/dashboard/user">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6">
                    {faqs.map((faq, index) => (
                        <Card key={index} className="p-4">
                            <CardHeader className="p-0">
                                <div className="flex items-center gap-3 mb-3">
                                <HelpCircle className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-white">Still have questions?</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Contact support any time for help with bookings, payments, or account issues.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-white" />
                                <div>
                                    <p className="font-semibold">Email Support</p>
                                    <p className="text-sm text-white/80">support@securedrives.com</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
