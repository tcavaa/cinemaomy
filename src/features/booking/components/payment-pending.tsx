"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Polls our verify endpoint (which asks Flitt) until the payment settles. */
export function PaymentPending({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  const router = useRouter();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let stopped = false;
    const check = async () => {
      attempts += 1;
      const res = await fetch(`/api/bookings/${bookingId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k: accessToken }),
      }).catch(() => null);
      const data = res?.ok ? ((await res.json()) as { status: string }) : null;
      if (stopped) return;
      if (data && data.status !== "pending") {
        router.refresh();
        return;
      }
      if (attempts === 10) setSlow(true);
      if (attempts < 60) timer = window.setTimeout(check, attempts < 10 ? 2500 : 6000);
    };
    let timer = window.setTimeout(check, 800);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [bookingId, accessToken, router]);

  return (
    <div role="status" className="flex flex-col items-start gap-4">
      <span className="flex items-center gap-3 font-meta text-[0.7rem] text-ink-2">
        <span className="size-2 animate-ping rounded-full bg-oxblood" />
        Confirming your payment with the bank…
      </span>
      {slow && (
        <p className="max-w-md font-ui text-[0.95rem] text-ink-2">
          This is taking longer than usual. You can keep this page open — it updates by itself — or come back to this
          link later.
        </p>
      )}
    </div>
  );
}
