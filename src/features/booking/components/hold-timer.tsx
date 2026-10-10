"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** `deadline` is on this browser's own clock, so a wrong system time can't end the hold early. */
function remaining(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

export function HoldTimer({ deadline, onExpire, className }: { deadline: number; onExpire: () => void; className?: string }) {
  const [seconds, setSeconds] = useState(() => remaining(deadline));
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const tick = () => {
      const left = remaining(deadline);
      setSeconds(left);
      if (left === 0) {
        window.clearInterval(id);
        onExpireRef.current();
      }
    };
    const id = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(id);
  }, [deadline]);

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
