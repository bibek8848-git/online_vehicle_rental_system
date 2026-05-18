'use client'
import { Car } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <div className="flex min-h-svh bg-background">
            <div className="flex flex-col flex-1 justify-center items-center p-6 lg:p-10">
                <div className="w-full max-w-sm space-y-8">
                    <Link href="/" className="flex items-center gap-3 self-center font-bold text-2xl tracking-tight">
                        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                            <Car className="h-6 w-6" />
                        </div>
                        Secure Drives
                    </Link>
                    <LoginForm />
                </div>
            </div>
            
            {/* Visual Side */}
            <div className="hidden lg:flex flex-1 relative bg-muted overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920" 
                    alt="Luxury Car" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4">Drive with Confidence.</h2>
                    <p className="text-xl text-white/80 max-w-md">Join our platform today and experience the most secure and seamless vehicle rental service.</p>
                </div>
            </div>
        </div>
    )
}
