"use client";

import { useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import AppControls from "@/components/AppControls";
import UserHeader from "@/components/UserHeader";
import TabBar, { TabKey } from "@/components/TabBar";
import Dashboard from "@/components/Dashboard";
import History from "@/components/History";
import DetailSheet from "@/components/DetailSheet";
import Toast from "@/components/Toast";

export default function Page() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [openPoId, setOpenPoId] = useState<string | null>(null);
  // Bumping this remounts the active tab's data-fetching effect so the
  // list reflects changes made in the detail sheet (regenerate/delete).
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChanged = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <ProgressBar />
      <AppControls />

      <div id="app">
        <UserHeader />
        <TabBar active={tab} onChange={setTab} />

        <main>
          {tab === "dashboard" ? (
            <Dashboard key={`dashboard-${refreshKey}`} onOpenPO={setOpenPoId} />
          ) : (
            <History key={`history-${refreshKey}`} onOpenPO={setOpenPoId} />
          )}
        </main>
      </div>

      {openPoId ? (
        <DetailSheet poId={openPoId} onClose={() => setOpenPoId(null)} onChanged={handleChanged} />
      ) : null}

      <Toast />
    </>
  );
}
