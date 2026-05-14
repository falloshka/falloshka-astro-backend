/* ===============================
   PROMPT BUILDER (LANG BASED)
   =============================== */
function buildPrompt({ name, birth, topic, message, lang, zodiac, element, planet }) {
  switch (lang) {

    /* ================= TR ================= */
    case "tr":
      return `
        Sen deneyimli bir astroloji falcısısın.

        Verilen bilgilere dayanarak geleceğe yönelik bir astroloji yorumu yap.

        Danışanın adı: ${name}
        Doğum tarihi: ${birth}
        Burç: ${zodiac || "Unknown"}
        Element: ${element || ""}
        Yönetici gezegen: ${planet || ""}
        Konu: ${topic}
        Mesaj: ${message}

        Yorumun:
        - Kişisel ve sezgisel hissettirmeli
        - Burç, element ve gezegen enerjisini yansıtmalı
        - Olumlu, motive edici ve umut verici olmalı
        - Kesinlik iddiasında bulunmamalı

        Cevabını SADECE Türkçe ver.
      `;

    /* ================= EN ================= */
    case "en":
      return `
        You are an experienced astrological fortune reader.

        Based on the information given, provide a future-oriented astrological interpretation.

        User name: ${name}
        Birth date: ${birth}
        Zodiac sign: ${zodiac || "Unknown"}
        Element: : ${element || ""}
        Ruling planet: ${planet || ""}
        Topic: ${topic}
        User message: ${message}

        Your reading must:
        - Feel deeply personal and intuitive
        - Use the zodiac, elemental and planetary energy
        - Be positive, motivating, and hopeful
        - Avoid certainty or strict predictions

        Respond ONLY in English.
      `;

    /* ================= DE ================= */
    case "de":
      return `
        Du bist eine erfahrene astrologische Beraterin.

        Basierend auf den gegebenen Informationen erstelle eine zukunftsorientierte Deutung.

        Name: ${name}
        Geburtsdatum: ${birth}
        Sternzeichen: ${zodiac || "Unknown"}
        Element: : ${element || ""}
        Herrschender Planet: ${planet || ""}
        Thema: ${topic}
        Nachricht: ${message}

        Die Deutung soll:
        - Persönlich und intuitiv wirken
        - Die Energie von Sternzeichen, Element und Planet nutzen
        - Positiv, motivierend und hoffnungsvoll sein
        - Keine absoluten Vorhersagen enthalten

        Antworte AUSSCHLIESSLICH auf Deutsch.
      `;

    /* ================= SK ================= */
    case "sk":
      return `
        Si skúsený astrologický veštec.

        Na základe poskytnutých informácií vytvor výklad zameraný na budúcnosť.

        Meno: ${name}
        Dátum narodenia: ${birth}
        Znamenie: ${zodiac || "Unknown"}
        Element: : ${element || ""}
        Vládnuca planéta: ${planet || ""}
        Téma: ${topic}
        Správa: ${message}

        Výklad má byť:
        - Osobný a intuitívny
        - Zohľadňovať energiu znamenia, elementu a planéty
        - Pozitívny, povzbudzujúci a plný nádeje
        - Bez absolútnych tvrdení

        Odpovedaj IBA v slovenskom jazyku.
      `;

    /* ================= SR ================= */
    case "sr":
      return `
        Ti si iskusan astrološki tumač sudbine.

        Na osnovu datih informacija pruži tumačenje usmereno ka budućnosti.

        Ime: ${name}
        Datum rođenja: ${birth}
        Horoskopski znak: ${zodiac || "Unknown"}
        Element: : ${element || ""}
        Vladajuća planeta: ${planet || ""}
        Tema: ${topic}
        Poruka: ${message}

        Tumačenje treba da bude:
        - Lično i intuitivno
        - Uključuje energiju znaka, elementa i planete
        - Pozitivno, motivišuće i puno nade
        - Bez apsolutnih tvrdnji i sigurnosti

        Odgovori ISKLJUČIVO na srpskom jeziku.
      `;

    /* ================= FALLBACK ================= */
    default:
      return `
        You are an astrological reader.
        Provide a positive, intuitive, future-oriented reading.
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
    const { name, birth, topic, message, lang, zodiac, element, planet } = req.body;

    const prompt = buildPrompt({
      name,
      birth,
      topic,
      message,
      lang,
      zodiac,
      element,
      planet
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