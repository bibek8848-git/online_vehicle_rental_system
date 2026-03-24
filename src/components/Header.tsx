"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string; role?: string; kyc_status?: string }>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const router = useRouter();

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
            const data = await res.json();
            if (data.success) setNotifications(data.data);
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

            if (res.ok) {
                fetchNotifications();
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

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Left: App Name */}
            <div className="text-xl font-bold text-blue-600 tracking-tight">
                Secure Drives
            </div>

            {/* Right: Profile + Theme Toggle + Logout */}
            <div className="flex items-center gap-4 relative">
                {/* Notifications */}
                {user && user.email && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="text-xl text-gray-600 dark:text-gray-300 hover:text-blue-600"
                        >
                            🔔 {notifications.filter((n:any) => !n.is_read).length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{notifications.filter((n:any) => !n.is_read).length}</span>}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                                <div className="p-2 border-b font-bold text-sm flex justify-between items-center">
                                    <span>Notifications</span>
                                    {notifications.some(n => !n.is_read) && (
                                        <button 
                                            onClick={() => markAsRead()}
                                            className="text-[10px] text-blue-600 hover:underline"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                {notifications.length > 0 ? notifications.map((n: any) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-3 text-xs border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${n.is_read ? 'opacity-60' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                                        onClick={() => !n.is_read && markAsRead(n.id)}
                                    >
                                        {n.message}
                                        <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                                    </div>
                                )) : <div className="p-4 text-center text-gray-500 text-xs">No notifications</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* Theme Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-xl ml-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
                        title="Toggle light/dark mode"
                    >
                        {theme === "dark" ? "🌞" : "🌙"}
                    </button>
                )}

                {/* Profile Info */}
                {user && user.email ? (
                    <>
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                {user.name || 'User'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                            </span>
                            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400">
                                {user.role}
                            </span>
                        </div>
                        {/* Avatar */}
                        {user.avatar && user.avatar.trim() !== '' ? (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-3 py-1 text-sm font-medium text-red-600 border border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 dark:border-red-500"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => router.push('/login')}
                            className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => router.push('/register')}
                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Register
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
