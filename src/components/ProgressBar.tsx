"use client";

import { useEffect, useRef, useState } from "react";
import { onProgress } from "@/lib/api";

export default function ProgressBar() {
  const [active, setActive] = useState(false);
  const count = useRef(0);

  useEffect(() => {
    return onProgress((increment) => {
      count.current += increment ? 1 : -1;
      if (count.current < 0) count.current = 0;
      setActive(count.current > 0);
    });
  }, []);

  return <div id="progress-bar" className={active ? "active" : ""} />;
}
