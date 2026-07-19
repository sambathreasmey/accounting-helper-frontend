"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast";

const EXIT_DURATION = 260;

export default function Toast() {
  const { message } = useToast();
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setDisplayed(message);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timeout = setTimeout(() => setDisplayed(null), EXIT_DURATION);
    return () => clearTimeout(timeout);
  }, [message]);

  return <div className={`toast${visible ? " show" : ""}`}>{displayed}</div>;
}