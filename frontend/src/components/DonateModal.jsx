import { useState } from "react";

const UPI_ID = "shahiduddin1710-4@okicici";

export default function DonateModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(15,23,42,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "backdropFade 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: "24px",
          padding: "2rem 1.75rem", maxWidth: "360px", width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
         textAlign: "center", animation: "modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
 {/* Heart icon */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#fff1f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
          Support NotesHub
        </h2>
        <p style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.7 }}>
        NotesHub is <strong>100% free and ad-free</strong>. If it helped you in your studies, consider supporting us, every contribution keeps this platform alive!
        </p>

        {/* QR Code */}
        <div style={{
          background: "#f8fafc", borderRadius: "16px",
          padding: "1rem", marginBottom: "1rem",
          display: "inline-block", width: "100%",
        }}>
          <img
            src="/scanner.jpeg"
            alt="UPI QR Code"
            style={{ width: 180, height: 180, objectFit: "contain", borderRadius: 8 }}
          />
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
            Scan with any UPI app
          </p>
        </div>

        {/* UPI ID copy */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#f1f5f9", borderRadius: "10px",
          padding: "0.6rem 0.8rem", marginBottom: "1.25rem",
        }}>
          <span style={{ flex: 1, fontSize: "0.82rem", color: "#334155", fontWeight: 600, textAlign: "left" }}>
            {UPI_ID}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#4f46e5" : "white",
              color: copied ? "white" : "#4f46e5",
              border: "1.5px solid #4f46e5",
              borderRadius: "7px", padding: "4px 12px",
              fontSize: "0.75rem", fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "#94a3b8" }}>
          100% optional. No pressure. We're grateful either way.
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "0.75rem",
            borderRadius: "12px", border: "none",
            background: "#0f172a", color: "white",
            fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}