export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight (CORS OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { name, birth, topic, message, lang } = req.body;

    const prompt = `
You are an experienced astrological fortune reader.
Give a positive, hopeful, future-oriented interpretation.

Name: ${name}
Birth date: ${birth}
Topic: ${topic}
Message: ${message}

Respond ONLY in ${lang}.
    `;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85,
        }),
      }
    );

    const data = await groqRes.json();
    const text = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: text || "The stars are quiet right now. Please try again.",
    });
  } catch (err) {
    return res.status(500).json({
      result: "The astral flow was disrupted. Please try again.",
    });
  }
}