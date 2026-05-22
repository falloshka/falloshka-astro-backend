import fetch from "node-fetch";

export default async function handler(req, res) {

  // ✅ CORS - FULL FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ PREFLIGHT handle
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }


  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });

    console.log("BUFFER LENGTH:", buffer.length);

    const hfRes = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream"
        },
        body: buffer
      }
    );

    console.log("HF STATUS:", hfRes.status);

    if (!hfRes.ok) {
      const text = await hfRes.text();
      console.log("HF ERROR:", text);

      return res.status(200).json({
        isCup: false,
        raw: { error: text }
      });
    }

    const data = await hfRes.json();
    console.log("HF RESPONSE:", data);

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
    console.error("ERROR:", err);

    return res.status(200).json({   // ✅ DİKKAT
      isCup: false,
      raw: { error: err.message }
    });
  }
}
