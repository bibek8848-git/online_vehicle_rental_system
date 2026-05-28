"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
    Bell, 
    Moon, 
    Sun, 
    LogOut, 
    LayoutDashboard, 
    Car, 
    Calendar, 
    ShieldCheck, 
    CreditCard, 
    User as UserIcon,
    ChevronDown,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string; role?: string; kyc_status?: string }>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);

        // Load user from localStorage
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                fetchNotifications();
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        } else {
            setUser({});
        }

        // Poll for notifications every 30 seconds
        const interval = setInterval(() => {
            if (localStorage.getItem("token")) {
                fetchNotifications();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text().catch(() => "N/A");
                console.error(`Expected JSON from /api/notifications but received: ${contentType}. Body: ${text.substring(0, 100)}`);
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to fetch notifications:", res.status, errorData.message || "Unknown error");
                return;
            }

            const data = await res.json();
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (notification_id?: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notification_id })
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text().catch(() => "N/A");
                console.error(`Expected JSON from /api/notifications (PATCH) but received: ${contentType}. Body: ${text.substring(0, 100)}`);
                if (res.ok) fetchNotifications();
                return;
            }

            if (res.ok) {
                fetchNotifications();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to mark notifications as read:", res.status, errorData.message);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    if (!mounted) {
        return (
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Car className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Secure Drives</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                    </div>
                </div>
            </header>
        );
    }

    const navLinks = user.role === 'PROVIDER' ? [
        { href: '/dashboard/provider', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/provider/vehicles', label: 'My Vehicles', icon: Car },
        { href: '/dashboard/provider/bookings', label: 'Bookings', icon: Calendar },
        { href: '/dashboard/provider/kyc', label: 'KYC', icon: ShieldCheck },
    ] : [
        { href: '/dashboard/user', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/user/vehicles', label: 'Browse Vehicles', icon: Car },
        { href: '/dashboard/user/bookings', label: 'My Bookings', icon: Calendar },
        { href: '/dashboard/user/kyc', label: 'KYC', icon: ShieldCheck },
        { href: '/dashboard/user/payments', label: 'Payments', icon: CreditCard },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                {/* Left: App Name */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                            <Car className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden sm:inline-block">Secure Drives</span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && user.email && (
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href} 
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${pathname === link.href ? 'bg-accent text-primary' : 'text-muted-foreground'}`}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full"
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    {user && user.email ? (
                        <>
                            {/* Notifications */}
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative rounded-full"
                                >
                                    <Bell className="h-5 w-5" />
                                    {notifications.filter((n:any) => !n.is_read).length > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                                            {notifications.filter((n:any) => !n.is_read).length}
                                        </span>
                                    )}
                                </Button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl border bg-card text-card-foreground shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden z-50">
                                        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                                            <h3 className="font-bold text-sm">Notifications</h3>
                                            {notifications.some(n => !n.is_read) && (
                                                <button 
                                                    onClick={() => markAsRead()}
                                                    className="text-xs font-semibold text-primary hover:underline"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map((n: any) => (
                                                <div 
                                                    key={n.id} 
                                                    className={`p-4 text-sm border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${n.is_read ? 'opacity-60' : 'bg-primary/5'}`}
                                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                                >
                                                    <p className="leading-snug">{n.message}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(n.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            )) : (
                                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                                    <Bell className="h-8 w-8 opacity-20" />
                                                    <p className="text-sm">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Menu */}
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-accent transition-all duration-200"
                                >
                                    {user.avatar && user.avatar.trim() !== '' ? (
                                        <img
                                            src={user.avatar}
                                            alt="avatar"
                                            className="h-8 w-8 rounded-full object-cover shadow-sm"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {(user.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="hidden sm:flex flex-col items-start text-left">
                                        <span className="text-xs font-bold leading-tight">{user.name || 'User'}</span>
                                        <span className="text-[10px] text-muted-foreground leading-tight uppercase tracking-wider">{user.role}</span>
                                    </div>
                                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border bg-card text-card-foreground shadow-xl ring-1 ring-black/5 p-2 z-50">
                                        <div className="px-3 py-2 mb-2 border-b">
                                            <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                                            <p className="text-sm font-bold truncate">{user.email}</p>
                                        </div>
                                        <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                                            <UserIcon className="h-4 w-4" />
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="hidden md:flex gap-3 ml-2">
                            <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
                            <Button onClick={() => router.push('/register')}>Get Started</Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t bg-card animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col p-4 space-y-2">
                        {user && user.email ? (
                            <>
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.href}
                                        href={link.href} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="pt-4 mt-2 border-t">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 p-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Button className="w-full" onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}>Login</Button>
                                <Button className="w-full" variant="outline" onClick={() => { router.push('/register'); setMobileMenuOpen(false); }}>Register</Button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
