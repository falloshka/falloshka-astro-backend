export default async function handler(req, res) {

  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    // ✅ RAW BODY AL (KRİTİK 🔥)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 🔥 HuggingFace request
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: buffer, // ✅ ARTIK DOĞRU
      }
    );

    const data = await hfRes.json();

    console.log("HF RESPONSE:", data);

    // ✅ SAFE CHECK
    if (!Array.isArray(data)) {
      return res.status(200).json({
        isCup: false,
        raw: data
      });
    }

    const isCup = data.some(item =>
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