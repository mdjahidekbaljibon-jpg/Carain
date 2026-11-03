export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "শুধু POST অনুরোধ গ্রহণ করা হয়।" });
  try {
    const body = req.body || {}, cfg = body.apiConfig || {};
    const endpoint = String(cfg.imageApiUrl || process.env.IMAGE_API_URL || "");
    const key = String(cfg.imageApiKey || process.env.IMAGE_API_KEY || "");
    if (!endpoint || !key) return res.status(503).json({ error: "Settings-এ Image API URL ও Key দাও।" });
    let parsed; try { parsed = new URL(endpoint); } catch { return res.status(400).json({ error: "Image API URL সঠিক নয়।" }); }
    if (parsed.protocol !== "https:") return res.status(400).json({ error: "নিরাপত্তার জন্য HTTPS Image API URL প্রয়োজন।" });
    const { prompt, referenceImage } = body;
    if (typeof prompt !== "string" || !referenceImage || typeof referenceImage !== "string") return res.status(400).json({ error: "Prompt এবং Reference Photo প্রয়োজন।" });
    if (referenceImage.length > 6000000) return res.status(413).json({ error: "Reference Photo অনেক বড়।" });
    const upstream = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key }, body: JSON.stringify({ prompt, reference_image: referenceImage, n: 1 }) });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.error?.message || data.error || "Image provider request failed." });
    const image = data.image_url || (data.image_base64 ? "data:image/png;base64," + data.image_base64 : null);
    if (!image) return res.status(502).json({ error: "Provider থেকে image_url অথবা image_base64 পাওয়া যায়নি।" });
    return res.status(200).json({ image });
  } catch (e) { return res.status(500).json({ error: "ছবি তৈরির অনুরোধ সম্পন্ন করা যায়নি।" }); }
}