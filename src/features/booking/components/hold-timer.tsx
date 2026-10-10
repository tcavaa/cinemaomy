"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function remaining(expiresAt: string) {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export function HoldTimer({ expiresAt, onExpire, className }: { expiresAt: string; onExpire: () => void; className?: string }) {
  const [seconds, setSeconds] = useState(() => remaining(expiresAt));
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const tick = () => {
      const left = remaining(expiresAt);
      setSeconds(left);
      if (left === 0) {
        window.clearInterval(id);
        onExpireRef.current();
      }
    };
    const id = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <p className={cn("flex items-center justify-between gap-4 font-meta text-[0.62rem] tracking-[0.2em]", className)}>
      <span>Seats held for</span>
      <span
        role="timer"
        aria-live="off"
        className={cn("font-label text-[1.1rem] tracking-[0.06em] tabular", seconds < 120 && "text-vermilion")}
      >
        {mm}:{ss}
      </span>
    </p>
  );
}
