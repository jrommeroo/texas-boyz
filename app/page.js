"use client";

import { useState, useRef, useCallback } from "react";

const SERVICES = [
  { id: "house_wash", label: "House Wash", icon: "🏠" },
  { id: "driveway", label: "Driveway Cleaning", icon: "🚗" },
  { id: "windows", label: "Window Cleaning", icon: "🪟" },
  { id: "solar", label: "Solar Panel Cleaning", icon: "☀️" },
];

const STEPS = ["Upload Photos", "Your Info", "Get Quote", "Book"];

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done ? "#00C2FF" : active ? "#fff" : "transparent",
                border: `2px solid ${done || active ? "#00C2FF" : "#444"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                color: done ? "#0a0a0a" : active ? "#0a0a0a" : "#666",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 10, color: active ? "#00C2FF" : done ? "#888" : "#555", whiteSpace: "nowrap", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 48, height: 2, background: done ? "#00C2FF" : "#2a2a2a", marginBottom: 18, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PhotoUploader({ photos, setPhotos }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 6 - photos.length);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setPhotos(prev => [...prev, { file, preview: e.target.result, base64: e.target.result.split(",")[1] }]);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [photos]);

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "#00C2FF" : "#333"}`,
          borderRadius: 12,
          padding: "40px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(0,194,255,0.05)" : "#111",
          transition: "all 0.2s",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
        <div style={{ color: "#ccc", fontSize: 15, fontWeight: 500 }}>Drop photos here or tap to upload</div>
        <div style={{ color: "#555", fontSize: 12, marginTop: 6 }}>Up to 6 photos • House, driveway, windows, panels</div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
      </div>

      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" }}>
              <img src={p.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceSelector({ selected, setSelected }) {
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {SERVICES.map(s => {
        const on = selected.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            style={{
              background: on ? "rgba(0,194,255,0.12)" : "#111",
              border: `1.5px solid ${on ? "#00C2FF" : "#2a2a2a"}`,
              borderRadius: 10,
              padding: "14px 10px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              color: on ? "#00C2FF" : "#888",
              fontWeight: on ? 600 : 400,
              fontSize: 14,
              transition: "all 0.2s",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function QuoteCard({ quote, loading, error }) {
  if (loading) return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ fontSize: 36, marginBottom: 16, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⚡</div>
      <div style={{ color: "#ccc", fontSize: 15 }}>Analyzing your photos...</div>
      <div style={{ color: "#555", fontSize: 12, marginTop: 6 }}>AI is reviewing size, condition & surface type</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "#1a0a0a", border: "1px solid #5a1a1a", borderRadius: 10, padding: 20, color: "#ff6b6b", fontSize: 14 }}>
      {error}
    </div>
  );

  if (!quote) return null;

  return (
    <div style={{ background: "#0d1a20", border: "1px solid #00C2FF33", borderRadius: 12, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Estimated Quote</div>
          <div style={{ color: "#00C2FF", fontSize: 36, fontWeight: 700 }}>{quote.price}</div>
        </div>
        <div style={{ background: "#00C2FF22", borderRadius: 8, padding: "6px 12px", color: "#00C2FF", fontSize: 12, fontWeight: 600 }}>
          {quote.confidence} confidence
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a2a30", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6 }}>{quote.summary}</div>
      </div>

      {quote.breakdown && quote.breakdown.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Breakdown</div>
          {quote.breakdown.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a2a30", color: "#ccc", fontSize: 14 }}>
              <span>{item.service}</span>
              <span style={{ color: "#00C2FF", fontWeight: 600 }}>{item.price}</span>
            </div>
          ))}
        </div>
      )}

      {quote.notes && (
        <div style={{ background: "#111", borderRadius: 8, padding: 12, color: "#777", fontSize: 13 }}>
          💡 {quote.notes}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [services, setServices] = useState([]);
  const [info, setInfo] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booked, setBooked] = useState(false);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");

  const generateQuote = async () => {
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const selectedLabels = SERVICES.filter(s => services.includes(s.id)).map(s => s.label);

      const imageContent = photos.slice(0, 4).map(p => ({
        type: "image",
        source: { type: "base64", media_type: p.file.type || "image/jpeg", data: p.base64 }
      }));

      const prompt = `You are a pricing assistant for Texas Boyz, a pressure washing and exterior cleaning company in Fort Worth, TX.

Analyze the uploaded photos and generate a realistic quote for the following services: ${selectedLabels.join(", ")}.

Customer address/notes: ${info.address || "Not provided"}. ${info.notes || ""}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "price": "$X - $Y",
  "confidence": "High" or "Medium" or "Low",
  "summary": "2-3 sentence summary of what you see and why you quoted this price",
  "breakdown": [
    { "service": "Service Name", "price": "$X - $Y" }
  ],
  "notes": "Any important notes or caveats about the quote"
}

Base pricing guidelines (Fort Worth market):
- House Wash: $150-$400 depending on size and condition
- Driveway Cleaning: $80-$200 depending on size and staining
- Window Cleaning: $100-$300 depending on count and access
- Solar Panel Cleaning: $100-$250 depending on panel count and access

Be realistic and specific based on what you actually see in the photos.`;

      const messages = [
        {
          role: "user",
          content: [
            ...imageContent,
            { type: "text", text: prompt }
          ]
        }
      ];

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages,
        })
      });

      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuote(parsed);
    } catch (e) {
      setError("Couldn't generate a quote right now. Please call us directly or try again with clearer photos.");
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep0 = photos.length > 0 && services.length > 0;
  const canProceedStep1 = info.name.trim() && info.phone.trim();

  if (booked) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div style={{ color: "#00C2FF", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>You're booked!</div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 24 }}>
            {info.name}, we'll see you on <strong style={{ color: "#fff" }}>{bookDate} at {bookTime}</strong>.<br />
            We'll text your confirmation to {info.phone}.
          </div>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
            <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Booking Summary</div>
            <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8 }}>
              <div>📍 {info.address || "Address TBD"}</div>
              <div>🧹 {SERVICES.filter(s => services.includes(s.id)).map(s => s.label).join(", ")}</div>
              <div>💰 Quoted: {quote?.price}</div>
            </div>
          </div>
          <div style={{ color: "#555", fontSize: 13 }}>Questions? Call or text us at <span style={{ color: "#00C2FF" }}>(682) 552-8009</span></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#00C2FF" }}>Texas</span> Boyz
          </div>
          <div style={{ color: "#555", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>Exterior Cleaning · Fort Worth</div>
        </div>
        <div style={{ color: "#555", fontSize: 12 }}>(682) 552-8009</div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px" }}>
        <StepIndicator current={step} />

        {/* Step 0: Photos + Services */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>Get an instant quote</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Upload photos of what needs cleaning and our AI will give you a real price estimate.</p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Photos</label>
              <PhotoUploader photos={photos} setPhotos={setPhotos} />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Services Needed</label>
              <ServiceSelector selected={services} setSelected={setServices} />
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              style={{
                width: "100%", padding: "16px", borderRadius: 10, border: "none",
                background: canProceedStep0 ? "#00C2FF" : "#1a1a1a",
                color: canProceedStep0 ? "#0a0a0a" : "#444",
                fontWeight: 700, fontSize: 15, cursor: canProceedStep0 ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {canProceedStep0 ? "Continue →" : photos.length === 0 ? "Add at least 1 photo" : "Select a service"}
            </button>
          </div>
        )}

        {/* Step 1: Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>Your info</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>We'll text your quote and any follow-up questions.</p>

            {[
              { key: "name", label: "Full Name", placeholder: "John Smith", required: true },
              { key: "phone", label: "Phone Number", placeholder: "(817) 555-0000", required: true },
              { key: "email", label: "Email", placeholder: "john@email.com" },
              { key: "address", label: "Property Address", placeholder: "123 Main St, Fort Worth TX" },
              { key: "notes", label: "Additional Notes", placeholder: "Oil stains on driveway, 2-story house..." },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                  {field.label} {field.required && <span style={{ color: "#00C2FF" }}>*</span>}
                </label>
                {field.key === "notes" ? (
                  <textarea
                    value={info[field.key]}
                    onChange={e => setInfo(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    style={{ width: "100%", background: "#111", border: "1.5px solid #222", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                ) : (
                  <input
                    type={field.key === "email" ? "email" : field.key === "phone" ? "tel" : "text"}
                    value={info[field.key]}
                    onChange={e => setInfo(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: "100%", background: "#111", border: "1.5px solid #222", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: 16, borderRadius: 10, background: "#111", border: "1.5px solid #222", color: "#888", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>← Back</button>
              <button
                onClick={() => { setStep(2); generateQuote(); }}
                disabled={!canProceedStep1}
                style={{ flex: 2, padding: 16, borderRadius: 10, border: "none", background: canProceedStep1 ? "#00C2FF" : "#1a1a1a", color: canProceedStep1 ? "#0a0a0a" : "#444", fontWeight: 700, fontSize: 15, cursor: canProceedStep1 ? "pointer" : "not-allowed" }}
              >
                Generate Quote →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Quote */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>Your quote</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Based on your photos and selected services.</p>

            <QuoteCard quote={quote} loading={loading} error={error} />

            {!loading && (quote || error) && (
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: 16, borderRadius: 10, background: "#111", border: "1.5px solid #222", color: "#888", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>← Back</button>
                {quote && (
                  <button
                    onClick={() => setStep(3)}
                    style={{ flex: 2, padding: 16, borderRadius: 10, border: "none", background: "#00C2FF", color: "#0a0a0a", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
                  >
                    Book Now →
                  </button>
                )}
              </div>
            )}

            {quote && !loading && (
              <div style={{ marginTop: 12, textAlign: "center", color: "#555", fontSize: 12 }}>
                Not happy with the quote? <span style={{ color: "#00C2FF", cursor: "pointer" }} onClick={() => { setStep(0); setQuote(null); }}>Start over</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Book */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>Pick a time</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Choose when you'd like us to come out. We'll confirm within the hour.</p>

            <div style={{ background: "#0d1a20", border: "1px solid #00C2FF33", borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your quote</div>
              <div style={{ color: "#00C2FF", fontSize: 24, fontWeight: 700 }}>{quote?.price}</div>
              <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{SERVICES.filter(s => services.includes(s.id)).map(s => s.label).join(" · ")}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Preferred Date</label>
              <input
                type="date"
                value={bookDate}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={e => setBookDate(e.target.value)}
                style={{ width: "100%", background: "#111", border: "1.5px solid #222", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", colorScheme: "dark" }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Preferred Time</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {["7:00 AM", "9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"].map(t => (
                  <button
                    key={t}
                    onClick={() => setBookTime(t)}
                    style={{
                      padding: "12px 8px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: bookTime === t ? "#00C2FF22" : "#111",
                      border: `1.5px solid ${bookTime === t ? "#00C2FF" : "#222"}`,
                      color: bookTime === t ? "#00C2FF" : "#888",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: 16, borderRadius: 10, background: "#111", border: "1.5px solid #222", color: "#888", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>← Back</button>
              <button
                onClick={() => { if (bookDate && bookTime) setBooked(true); }}
                disabled={!bookDate || !bookTime}
                style={{ flex: 2, padding: 16, borderRadius: 10, border: "none", background: bookDate && bookTime ? "#00C2FF" : "#1a1a1a", color: bookDate && bookTime ? "#0a0a0a" : "#444", fontWeight: 700, fontSize: 15, cursor: bookDate && bookTime ? "pointer" : "not-allowed" }}
              >
                Confirm Booking ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
