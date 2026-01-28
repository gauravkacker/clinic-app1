import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Homoeopathic Clinic Management System",
  description: "Complete clinic management solution for homoeopathic practitioners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-indigo-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold">
                    🏥 Homoeopathic Clinic
                  </Link>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <Link href="/" className="hover:text-indigo-200">Dashboard</Link>
                  <Link href="/appointments" className="hover:text-indigo-200">Appointments</Link>
                  <Link href="/patients" className="hover:text-indigo-200">Patients</Link>
                  <Link href="/cases" className="hover:text-indigo-200">Cases</Link>
                  <Link href="/prescriptions" className="hover:text-indigo-200">Prescriptions</Link>
                  <Link href="/fees" className="hover:text-indigo-200">Fees</Link>
                  <Link href="/reports" className="hover:text-indigo-200">Reports</Link>
                  <Link href="/settings" className="hover:text-indigo-200">Settings</Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Mobile Navigation */}
          <nav className="md:hidden bg-indigo-600">
            <div className="px-4 py-2 space-y-2">
              <Link href="/" className="block py-2 px-3 rounded hover:bg-indigo-500">Dashboard</Link>
              <Link href="/appointments" className="block py-2 px-3 rounded hover:bg-indigo-500">Appointments</Link>
              <Link href="/patients" className="block py-2 px-3 rounded hover:bg-indigo-500">Patients</Link>
              <Link href="/cases" className="block py-2 px-3 rounded hover:bg-indigo-500">Cases</Link>
              <Link href="/prescriptions" className="block py-2 px-3 rounded hover:bg-indigo-500">Prescriptions</Link>
              <Link href="/fees" className="block py-2 px-3 rounded hover:bg-indigo-500">Fees</Link>
              <Link href="/reports" className="block py-2 px-3 rounded hover:bg-indigo-500">Reports</Link>
              <Link href="/settings" className="block py-2 px-3 rounded hover:bg-indigo-500">Settings</Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-gray-400 py-4 mt-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>© {new Date().getFullYear()} Homoeopathic Clinic Management System</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
