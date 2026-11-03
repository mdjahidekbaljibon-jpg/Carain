export async function onRequestPost({ request, env }) {
  try {
    if (!env.GEMINI_API_KEY) return Response.json({ error: "সার্ভারে Gemini API Key সেট করা হয়নি।" }, { status: 503 });
    const body = await request.json();
    const message = String(body.message || "").slice(0, 12000);
    const adultMode = body.mode === "adult";
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    const parts = [];
    for (const item of history) {
      if (!item || !["user", "model"].includes(item.role)) continue;
      parts.push({ role: item.role, parts: [{ text: String(item.text || "").slice(0, 12000) }] });
    }
    const currentParts = [{ text: message || "এই ছবিটি বিশ্লেষণ করো।" }];
    if (body.image?.data && body.image?.mimeType && /^image\/(png|jpeg|webp|gif)$/.test(body.image.mimeType)) {
      if (String(body.image.data).length > 7_000_000) return Response.json({ error: "ছবিটি খুব বড়। ছোট ছবি ব্যবহার করো।" }, { status: 413 });
      currentParts.push({ inline_data: { mime_type: body.image.mimeType, data: body.image.data } });
    }
    const contents = [...parts, { role: "user", parts: currentParts }];
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: adultMode ? "You are CARAIN AI in an adults-only conversation mode. The user has self-attested to being 18 or older; this is not verified. You may discuss adult relationships, intimacy, consent, boundaries, sexual wellbeing, and sexual health in a respectful, educational, non-graphic way. Do not produce explicit pornographic sexual descriptions or sexual content involving minors, coercion, or non-consent. If age is uncertain, keep the response non-explicit." : "You are CARAIN AI, a helpful assistant. Respond clearly and respectfully." }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } })
    });
    const result = await upstream.json();
    if (!upstream.ok) return Response.json({ error: result.error?.message || "Gemini API অনুরোধ ব্যর্থ হয়েছে।" }, { status: upstream.status });
    const reply = result.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!reply) return Response.json({ error: "AI কোনো উত্তর দেয়নি। আবার চেষ্টা করো।" }, { status: 502 });
    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: "অনুরোধটি প্রক্রিয়া করা যায়নি।" }, { status: 400 });
  }
}