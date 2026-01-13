'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import SearchParamHandler from './SearchParamHandler'

export default function Home() {
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Root page is now handled by Middleware.
        // If we reach here, it's either because Middleware allowed it (valid token)
        // or something is wrong.
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")
        
        if (!token || !user) {
            // Middleware should have redirected to /login already
            setIsLoading(false);
        } else {
            // Authenticated - Middleware should have redirected to dashboard
            // If we are still here, it might be a brief moment before redirect or a mismatch
            try {
                const parsedUser = JSON.parse(user);
                const role = parsedUser.role;
                if (role) {
                    router.push(`/dashboard/${role.toLowerCase()}`);
                } else {
                    setIsLoading(false);
                }
            } catch (e) {
                setIsLoading(false);
            }
        }
    }, [router])

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
            <SearchParamHandler />
            <Header />
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                        Welcome to Secure Drives
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Your authentication is working correctly. This is the main landing page.
                    </p>
                </div>
            </main>
        </div>
    )
}


