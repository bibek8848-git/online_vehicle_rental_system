import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // ✅ import provider
import { Toaster } from "@/components/ui/sonner";
import ChatbotWrapper from "@/components/ChatbotWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SecureDrives",
    description: "Manage your day with clean & simple productivity UI",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Providers>
            {children}
            <ChatbotWrapper />
            <Toaster position="top-center" richColors />
        </Providers>
        </body>
        </html>
    );
}
