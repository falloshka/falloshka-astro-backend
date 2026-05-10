/* ===============================
   PROMPT BUILDER (LANG BASED)
   =============================== */
function buildPrompt({ name, birth, topic, message, lang }) {
  switch (lang) {
    /* -------- TR -------- */
    case "tr":
      return `
Sen deneyimli bir astroloji falcısısın.
Sana verilen bilgilere dayanarak danışanın geleceğine dair bir yorum yapacaksın.

Danışanın adı: ${name}
Doğum tarihi: ${birth}
Odak konusu: ${topic}
Danışanın mesajı: ${message}

Yorumun:
- Geleceğe yönelik olmalı
- Olumlu, motive edici ve umut verici olmalı
- Kesinlik iddiasında bulunmamalı
- Rehberlik eden, sakin ve iç rahatlatıcı bir dil kullanmalı

Cevabını SADECE Türkçe ver.
      `;

    /* -------- EN -------- */
    case "en":
      return `
You are an experienced astrological fortune reader.
Based on the information given, provide a future-oriented astrological interpretation.

Name: ${name}
Birth date: ${birth}
Focus topic: ${topic}
User message: ${message}

Your reading must be:
- Positive, motivating, and hopeful
- Emotionally reassuring
- Future-oriented
- Avoid absolute predictions or certainty claims

Respond ONLY in English.
      `;

    /* -------- DE -------- */
    case "de":
      return `
Du bist eine erfahrene astrologische Beraterin.
Basierend auf den folgenden Informationen sollst du eine zukunftsorientierte Deutung geben.

Name: ${name}
Geburtsdatum: ${birth}
Thema: ${topic}
Nachricht: ${message}

Die Deutung soll:
- Positiv, motivierend und hoffnungsvoll sein
- Ruhig, unterstützend und einfühlsam formuliert sein
- Keine absoluten Vorhersagen enthalten

Antworte AUSSCHLIESSLICH auf Deutsch.
      `;

    /* -------- SK -------- */
    case "sk":
      return `
Si skúsený astrologický veštec.
Na základe poskytnutých informácií vytvor výklad týkajúci sa budúcnosti.

Meno: ${name}
Dátum narodenia: ${birth}
Téma: ${topic}
Správa používateľa: ${message}

Výklad má byť:
- Pozitívny, povzbudzujúci a plný nádeje
- Zameraný na budúcnosť
- Bez absolútnych istôt alebo predpovedí

Odpovedaj IBA v slovenskom jazyku.
      `;

    /* -------- SR -------- */
    case "sr":
      return `
Ti si iskusan astrološki tumač sudbine.
Na osnovu datih informacija pruži tumačenje usmereno ka budućnosti.

Ime: ${name}
Datum rođenja: ${birth}
Tema: ${topic}
Poruka korisnika: ${message}

Tumačenje treba da bude:
- Pozitivno, motivišuće i puno nade
- Usmereno ka budućnosti
- Bez tvrdnji o apsolutnoj sigurnosti

Odgovori ISKLJUČIVO na srpskom jeziku.
      `;

    /* -------- FALLBACK -------- */
    default:
      return `
You are an experienced astrological reader.
Provide a positive, hopeful, future-oriented interpretation.
Respond in English.
      `;
  }
}

/* ===============================
   VERCEL SERVERLESS FUNCTION
   =============================== */
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
    const { name, birth, topic, message, lang } = req.body;

    const prompt = buildPrompt({
      name,
      birth,
      topic,
      message,
      lang,
    });

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // ✅ GÜNCEL ve ÇALIŞAN MODEL
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85,
        }),
      }
    );

    const data = await groqRes.json();

    if (data.error) {
      return res.status(500).json({
        result: `Groq error: ${data.error.message}`,
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: text || "The cosmic energies are quiet right now.",
    });

  } catch (err) {
    return res.status(500).json({
      result: "The astral flow was disrupted. Please try again.",
    });
  }
}