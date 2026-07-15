import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflare Pages & FastAPI App",
  description: "High-performance static Next.js frontend with Python API backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight text-emerald-400">
              Cloudflare × FastAPI
            </h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              Static Frontend
            </span>
          </div>
        </header>

        <main className="flex-grow max-w-6xl w-full mx-auto p-6">
          {children}
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/20 py-6 text-center text-sm text-slate-500">
          Deployed globally at Cloudflare Edge
        </footer>
      </body>
    </html>
  );
}