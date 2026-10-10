"use client";

// Last-resort boundary: renders its own document, so styles are inline.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#15100e", color: "#efe4d2", fontFamily: "Georgia, serif" }}>
        <title>Cinema O&apos;my</title>
        <div style={{ padding: 24, maxWidth: 560 }}>
          <h1 style={{ fontSize: 48, margin: "0 0 16px", lineHeight: 1 }}>The film snapped.</h1>
          <p style={{ fontSize: 18, opacity: 0.75 }}>Something went wrong. Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 24, padding: "12px 20px", background: "#efe4d2", color: "#1b1512", border: 0, font: "600 14px system-ui", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
