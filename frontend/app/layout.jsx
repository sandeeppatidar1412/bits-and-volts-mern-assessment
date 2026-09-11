import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata = { title: { default: "Naik Foods", template: "%s | Naik Foods" }, description: "Regional snacks, pickles, sweets and pantry favourites from Naik Foods.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") };
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5, userScalable: true };
export default function RootLayout({ children }) { return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}><body className="min-h-full bg-slate-50 text-slate-900"><AuthProvider><Navbar />{children}<Chatbot /></AuthProvider></body></html>; }