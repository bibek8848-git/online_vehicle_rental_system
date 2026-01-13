'use client'
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    useEffect(() => {
        // If we are on the login page, it means Middleware didn't find a valid token cookie.
        // We should check if localStorage has a stale token and clear it to prevent loops.
        const token = localStorage.getItem("token");
        if (token) {
            console.log("Stale session detected, clearing localStorage");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Secure Drives
                </a>
                <LoginForm />
            </div>
        </div>
    )
}
