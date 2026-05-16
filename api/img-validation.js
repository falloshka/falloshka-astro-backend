export default async function handler(req, res) {

  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    // 🔥 HuggingFace request
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: req.body,
      }
    );

    const data = await hfRes.json();

    console.log("HF RESPONSE:", data);

    // ✅ Cup detection logic
    const isCup = Array.isArray(data) && data.some(item =>
      item.label?.toLowerCase().includes("cup") ||
      item.label?.toLowerCase().includes("coffee") ||
      item.label?.toLowerCase().includes("mug")
    );

    return res.status(200).json({
      isCup,
      raw: data
    });

  } catch (err) {
    console.error("VALIDATION ERROR:", err);

    return res.status(500).json({
      error: "Image validation failed"
    });
  }
}