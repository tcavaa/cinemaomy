"use client";

import { useEffect, useRef, useState } from "react";

// Flitt embedded checkout (docs.flitt.com/api/embedded-custom). The order is
// created on our server; the browser only ever receives its payment token.
const SCRIPT_URL = "https://pay.flitt.com/latest/checkout-vue/checkout.js";
const STYLE_URL = "https://pay.flitt.com/latest/checkout-vue/checkout.css";

type FlittModel = { attr?: (path: string) => unknown } & Record<string, unknown>;
type FlittApp = {
  $on: (event: "ready" | "success" | "error" | "callback", handler: (model: FlittModel) => void) => FlittApp;
  $destroy: () => void;
  $el?: Element;
};

declare global {
  interface Window {
    checkout?: (element: Element | string, config: Record<string, unknown>) => FlittApp;
  }
}

let loader: Promise<void> | null = null;

function loadFlitt(): Promise<void> {
  if (typeof window.checkout === "function") return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${STYLE_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = STYLE_URL;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      reject(new Error("Could not load the payment form"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

function errorMessage(model: FlittModel): string {
  const fromAttr = model.attr?.("error.message");
  if (typeof fromAttr === "string" && fromAttr) return fromAttr;
  const error = model.error as { message?: string } | undefined;
  return error?.message || "The payment did not go through.";
}

type Props = {
  token: string;
  onSuccess: () => void;
  onError?: (message: string) => void;
};

export function FlittCheckout({ token, onSuccess, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onSuccess, onError });
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    handlers.current = { onSuccess, onError };
  });

  useEffect(() => {
    const host = hostRef.current;
    let app: FlittApp | undefined;
    let cancelled = false;
    const readyFallback = window.setTimeout(() => !cancelled && setState((s) => (s === "loading" ? "ready" : s)), 5000);

    loadFlitt()
      .then(() => {
        if (cancelled || !host || !window.checkout) return;
        const mount = document.createElement("div");
        host.appendChild(mount);
        app = window.checkout(mount, {
          options: {
            methods: ["card"],
            methods_disabled: [],
            card_icons: ["mastercard", "visa"],
            active_tab: "card",
            full_screen: false,
            show_menu_first: false,
            show_title: false,
            show_link: false,
            show_order_desc: false,
            show_lang: false,
            locales: ["en", "ka"],
            theme: { type: "light", preset: "reset" },
          },
          params: { token },
          css_variable: { main: "#931a14", card_bg: "#1b1512", card_shadow: "#b0623b", border_radius: 0 },
        });
        app.$on("ready", () => setState("ready"));
        app.$on("success", () => handlers.current.onSuccess());
        app.$on("error", (model) => handlers.current.onError?.(errorMessage(model)));
      })
      .catch(() => !cancelled && setState("failed"));

    return () => {
      cancelled = true;
      window.clearTimeout(readyFallback);
      try {
        app?.$destroy();
        app?.$el?.remove();
      } catch {
        // The widget may already be gone.
      }
      if (host) host.innerHTML = "";
    };
  }, [token]);

  return (
    <div className="relative min-h-[320px]">
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center font-meta text-[0.65rem] text-ink-3">
          Loading secure payment form…
        </div>
      )}
      {state === "failed" && (
        <p role="alert" className="font-ui text-[0.95rem] text-vermilion">
          The payment form could not be loaded. Check your connection and try again.
        </p>
      )}
      <div ref={hostRef} className="flitt-host" />
    </div>
  );
}
