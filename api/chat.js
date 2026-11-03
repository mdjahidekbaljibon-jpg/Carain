export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "শুধু POST অনুরোধ গ্রহণ করা হয়।" });
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: "সার্ভারে GEMINI_API_KEY সেট করা হয়নি।" });
    const body = req.body || {};
    const message = String(body.message || "").slice(0, 12000);
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    const contents = [];
    for (const item of history) {
      if (!item || !["user", "model"].includes(item.role)) continue;
      contents.push({ role: item.role, parts: [{ text: String(item.text || "").slice(0, 12000) }] });
    }
    const parts = [{ text: message || "এই ছবিটি বিশ্লেষণ করো।" }];
    if (body.image?.data && body.image?.mimeType && /^image\/(png|jpeg|webp|gif)$/.test(body.image.mimeType)) {
      if (String(body.image.data).length > 7000000) return res.status(413).json({ error: "ছবিটি খুব বড়।" });
      parts.push({ inline_data: { mime_type: body.image.mimeType, data: body.image.data } });
    }
    contents.push({ role: "user", parts });
    const adult = body.mode === "adult";
    const system = adult
      ? "You are CARAIN AI in adults-only mode for a self-attested adult. Discuss adult relationships, consent, boundaries and sexual wellbeing respectfully and non-graphically. Do not produce explicit pornographic descriptions or sexual content involving minors, coercion or non-consent."
      : "You are CARAIN AI, a helpful, accurate and respectful assistant. Reply in the user's language, especially Bengali.";
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.error?.message || "Gemini API request failed." });
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!reply) return res.status(502).json({ error: "Gemini কোনো উত্তর দেয়নি।" });
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "সার্ভার অনুরোধটি সম্পন্ন করতে পারেনি।" });
  }
}