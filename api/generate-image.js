export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "শুধু POST অনুরোধ গ্রহণ করা হয়।" });
  const endpoint = process.env.IMAGE_API_URL;
  const key = process.env.IMAGE_API_KEY;
  if (!endpoint || !key) return res.status(503).json({ error: "ছবি তৈরির API এখনো সংযুক্ত হয়নি। Vercel-এ IMAGE_API_URL এবং IMAGE_API_KEY সেট করো।" });
  try {
    const { prompt, referenceImage } = req.body || {};
    if (typeof prompt !== "string" || !referenceImage || typeof referenceImage !== "string") {
      return res.status(400).json({ error: "Prompt এবং Reference Photo প্রয়োজন।" });
    }
    if (referenceImage.length > 6_000_000) return res.status(413).json({ error: "Reference Photo অনেক বড়। ছোট ছবি ব্যবহার করো।" });
    // Provider adapter contract: configure an endpoint that accepts this JSON shape
    // and returns { image_url: "https://..." } or { image_base64: "..." }.
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({ prompt, reference_image: referenceImage, n: 1 })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.error?.message || data.error || "Image provider request failed." });
    const image = data.image_url || (data.image_base64 ? "data:image/png;base64," + data.image_base64 : null);
    if (!image) return res.status(502).json({ error: "Image provider থেকে image_url অথবা image_base64 পাওয়া যায়নি।" });
    return res.status(200).json({ image });
  } catch (error) {
    return res.status(500).json({ error: "ছবি তৈরির অনুরোধ সম্পন্ন করা যায়নি।" });
  }
}