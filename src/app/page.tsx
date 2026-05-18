'use client'

import { Suspense } from 'react'
import Header from '@/components/Header'
import SearchParamHandler from './SearchParamHandler'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Car, Shield, Clock, MapPin, Star, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={null}>
                <SearchParamHandler />
            </Suspense>
            <Header />
            
            <main>
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
                    
                    <div className="container px-4 md:px-8 mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                    <Star className="h-3 w-3 fill-current" />
                                    The Future of Vehicle Rental
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                                    Your Premium <br />
                                    <span className="text-primary">Driving Experience</span> <br />
                                    Starts Here.
                                </h1>
                                <p className="text-xl text-muted-foreground max-w-lg">
                                    Book luxury, economy, or electric vehicles with absolute confidence. Secure, transparent, and built for your journey.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="h-14 px-8 text-lg" asChild>
                                        <Link href="/register">
                                            Get Started <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
                                        <Link href="/dashboard/user/vehicles">
                                            Browse Vehicles
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center gap-8 pt-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                                                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold">2k+</span> Happy Customers
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border aspect-[4/3] bg-muted">
                                    <img 
                                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200" 
                                        alt="Luxury Car" 
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl border max-w-[200px] animate-bounce-slow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-bold uppercase">Verified</span>
                                    </div>
                                    <p className="text-sm font-medium">All vehicles undergo 100+ point inspection.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-card">
                    <div className="container px-4 md:px-8 mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Secure Drives?</h2>
                            <p className="text-muted-foreground text-lg">We provide a seamless experience for both vehicle owners and renters with industry-leading security and ease of use.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Verified Identity",
                                    desc: "Our robust KYC system ensures that every user on the platform is verified and trustworthy.",
                                    icon: Shield,
                                    color: "bg-blue-500/10 text-blue-600"
                                },
                                {
                                    title: "Instant Booking",
                                    desc: "Find the perfect vehicle and book it within minutes. No more tedious paperwork or waiting.",
                                    icon: Clock,
                                    color: "bg-orange-500/10 text-orange-600"
                                },
                                {
                                    title: "Wide Coverage",
                                    desc: "Access a diverse range of vehicles across multiple locations, from city cars to luxury SUVs.",
                                    icon: MapPin,
                                    color: "bg-green-500/10 text-green-600"
                                }
                            ].map((feature, i) => (
                                <Card key={i} className="hover:border-primary/20">
                                    <CardContent className="pt-8">
                                        <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                            <feature.icon className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24">
                    <div className="container px-4 md:px-8 mx-auto">
                        <div className="bg-primary rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
                            <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-6 relative">Ready to hit the road?</h2>
                            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative">
                                Join thousands of satisfied users who have transformed their travel experience with Secure Drives.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 relative">
                                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg" asChild>
                                    <Link href="/register">Sign Up Now</Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-transparent text-white border-white/30 hover:bg-white/10" asChild>
                                    <Link href="/dashboard/user/vehicles">Explore Cars</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t bg-muted/30">
                <div className="container px-4 md:px-8 mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Car className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">Secure Drives</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 Secure Drives. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}


