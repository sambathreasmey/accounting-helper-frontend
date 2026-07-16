"use client";

import { useToast } from "@/lib/toast";

export default function Toast() {
  const { message } = useToast();
  return <div className={`toast${message ? "" : " hidden"}`}>{message}</div>;
}
