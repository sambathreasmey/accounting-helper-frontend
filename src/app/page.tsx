"use client";

import { useEffect, useState } from "react";
import { Server, Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";

interface Item {
  id: number;
  name: string;
  status: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [apiUrl, setApiUrl] = useState<string>("");

  const fetchBackendData = async () => {
    setLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
    setApiUrl(backendUrl);

    try {
      const res = await fetch(`${backendUrl}/api/v1/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Backend responded with an error");

      const data = await res.json();
      setItems(data);
      setIsConnected(true);
    } catch (err) {
      console.error("API connection failed:", err);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  return (
    <div className="space-y-8 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Service Overview</h2>
        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
          This Next.js static interface is compiled to optimize delivery speeds directly from Cloudflare’s CDN, interacting securely with your hosting domain running FastAPI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Backend Status</span>
            <div className="flex items-center gap-2 mt-2">
              {isConnected === null ? (
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse" />
              ) : isConnected ? (
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              ) : (
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              )}
              <h3 className="font-semibold">
                {isConnected === null ? "Diagnosing..." : isConnected ? "Connected" : "Unreachable"}
              </h3>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 break-all">
            Target URL: <code className="text-slate-300 font-mono">{apiUrl || "None configured"}</code>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">System Sync</span>
              <p className="text-slate-300 text-sm mt-1">Refresh to pull updated datasets stored by your FastAPI processes.</p>
            </div>
            <button 
              onClick={fetchBackendData}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-wide">FastAPI Datasets</span>
          <span className="text-xs text-slate-500 font-mono">Found: {items.length} records</span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
              <p className="text-slate-400 text-sm">Querying active records...</p>
            </div>
          ) : isConnected === false ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
              <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
              <h4 className="font-semibold text-slate-200">Unable to Fetch API Data</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Make sure your FastAPI server is online and has **CORS middleware configured** to explicitly allow requests from your site's domain.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No items found in database schema.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-slate-200">{item.name}</h5>
                    <span className="text-xs text-slate-500 font-mono">ID: {item.id}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}