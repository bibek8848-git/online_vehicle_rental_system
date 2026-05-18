'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"


import { AlertCircle } from "lucide-react"

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    function loginWithGoogle() {
        window.location.href = '/api/auth/google';
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (data.success) {
                // Store token in localStorage and cookies
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Set cookie for middleware
                document.cookie = `token=${data.token}; path=/; max-age=3600; SameSite=Lax`;
                document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=3600; SameSite=Lax`;
                
                // Redirect to role-specific dashboard
                const role = data.user.role;
                if (role === 'ADMIN') {
                    router.push('/dashboard/admin');
                } else if (role === 'PROVIDER') {
                    router.push('/dashboard/provider');
                } else {
                    router.push('/dashboard/user');
                }
            } else {
                setError(data.message || "Login failed")
            }
        } catch (err) {
            setError("An error occurred during login")
            console.error(err)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription className="text-lg">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            <div className="grid gap-4">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-input/50 hover:bg-accent hover:text-accent-foreground transition-all" onClick={loginWithGoogle} type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground font-semibold">
                                        Or continue with email
                                    </span>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="text-sm font-medium">{error}</span>
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        className="h-12 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="text-sm font-medium text-primary hover:underline underline-offset-4"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        required 
                                        className="h-12 rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
                                    Sign In
                                </Button>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                New to Secure Drives?{" "}
                                <a href="/register" className="font-bold text-primary hover:underline underline-offset-4">
                                    Create an account
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
