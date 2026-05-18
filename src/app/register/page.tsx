import { Car } from "lucide-react"
import Link from "next/link"

import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
    return (
        <div className="flex min-h-svh bg-background">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-1 relative bg-muted overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920" 
                    alt="Driving" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4">Start Your Journey.</h2>
                    <p className="text-xl text-white/80 max-w-md">Whether you're looking to rent or provide, Secure Drives is your trusted partner for the road ahead.</p>
                </div>
            </div>

            <div className="flex flex-col flex-1 justify-center items-center p-6 lg:p-10">
                <div className="w-full max-w-sm space-y-8">
                    <Link href="/" className="flex items-center gap-3 self-center font-bold text-2xl tracking-tight">
                        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                            <Car className="h-6 w-6" />
                        </div>
                        Secure Drives
                    </Link>
                    <RegisterForm />
                </div>
            </div>
        </div>
    )
}