"use client";
// Last resort if the whole app fails to load: a plain page with a reload button.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en-GB">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, color: "#1E2A44", background: "#F7F8FC" }}>
        <h1 style={{ fontSize: 22 }}>RMR Hub couldn&apos;t load</h1>
        <p>This often happens just after an update. Reload to get the latest version.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12, minHeight: 44, padding: "0 20px", borderRadius: 12, border: 0, background: "#2563EB", color: "#fff", fontWeight: 700 }}
        >
          Reload
        </button>
        {error.digest && <p style={{ fontSize: 12, color: "#64748B" }}>Error reference: {error.digest}</p>}
      </body>
    </html>
  );
}
