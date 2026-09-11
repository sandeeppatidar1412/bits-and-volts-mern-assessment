import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata = { title: "Naik Foods", description: "Modern food e-commerce experience" };
export default function RootLayout({ children }) { return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}><body className="min-h-full bg-slate-50 text-slate-900"><AuthProvider><Navbar />{children}<Chatbot /></AuthProvider></body></html>; }