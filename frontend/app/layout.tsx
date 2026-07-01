import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Karthik's Fitness App",
  description: "Personal 6-month fitness tracker — 89kg to 78kg",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Fitness" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <main className="max-w-md mx-auto min-h-screen pb-24">{children}</main>
        <BottomNav />
        <Toaster position="top-center" toastOptions={{
          style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
        }} />
      </body>
    </html>
  );
}
