/* ===============================
PROMPT BUILDER (LANG BASED)
=============================== */
function buildPrompt({ past, present, future, lang }) {
  switch (lang) {

    /* ---------- TR ---------- */
    case "tr":
      return `
Sen deneyimli bir astrolog ve tarot uzmanısın.
Bu bir tarot falıdır ve eğlence amaçlıdır, bilimsel bir gerçek değildir.

Çekilen kartlar:
Geçmiş: ${past}
Şimdi: ${present}
Gelecek: ${future}

Kurallar:
- Tam olarak 2 paragraf yaz
- Toplam uzunluk 75–100 kelime olsun
- Cinsiyetten bağımsız, herkese hitap eden bir dil kullan
- Pozitif ama gerçekçi ol
- Kesinlik iddiasında bulunma
- “enerjiler, ihtimaller, geçmişin etkileri” gibi ifadeler kullan
- Bunun bir tarot falı olduğunu mutlaka belirt

Yorumunu şimdi oluştur mistik ve ruhani bir falci sekilde. Yourmda samimi siz degil sen diye hitap et.
Cevabını SADECE Türkçe ver.
`;

    /* ---------- EN ---------- */
    case "en":
      return `
You are an experienced astrologer and tarot expert.
This is a tarot reading created for entertainment purposes only, not a scientific fact.

The drawn cards are:
Past: ${past}
Present: ${present}
Future: ${future}

Rules:
- Write exactly 2 paragraphs
- Total length must be between 75 and 100 words
- Use gender-neutral language
- Positive but realistic tone
- No claims of certainty
- Use language such as energies, possibilities, influences from the past
- Clearly state that this is a tarot reading

Create your comment now in a mystical and spiritual fortune teller style. Write warmly and personally — use “you” informally, not formally.
Respond ONLY in English.
`;

    /* ---------- DE ---------- */
    case "de":
      return `
Du bist eine erfahrene Astrologin und Tarot-Expertin.
Dies ist eine Tarot-Lesung zu Unterhaltungszwecken und stellt keine wissenschaftliche Wahrheit dar.

Gezogene Karten:
Vergangenheit: ${past}
Gegenwart: ${present}
Zukunft: ${future}

Regeln:
- Genau 2 Absätze
- Insgesamt 75–100 Wörter
- Geschlechtsneutral formulieren
- Positiv, aber realistisch
- Keine absoluten Vorhersagen
- Mit Begriffen wie Energien, Möglichkeiten, frühere Einflüsse arbeiten
- Klar als Tarot-Lesung kennzeichnen

Erschaffe jetzt deinen Kommentar in einer mystischen und spirituellen Wahrsager-Art. Schreib herzlich und persönlich — sprich nicht mit „Sie“, sondern mit „du“.
Antworte AUSSCHLIESSLICH auf Deutsch.
`;

    /* ---------- SR ---------- */
    case "sr":
      return `
Ti si iskusan astrolog i tarot tumač.
Ovo je tarot tumačenje namenjeno zabavi, a ne naučna činjenica.

Izvučene karte:
Prošlost: ${past}
Sadašnjost: ${present}
Budućnost: ${future}

Pravila:
- Tačno 2 pasusa
- Dužina 75–100 reči
- Rodno neutralan jezik
- Pozitivno ali realistično
- Bez tvrdnji o apsolutnoj sigurnosti
- Koristi izraze poput energija, mogućnosti, uticaji prošlosti
- Jasno navedi da je u pitanju tarot tumačenje

Sada napravi svoj komentar u mističnom i duhovnom stilu proroka. Piši iskreno i prisno — obraćaj se sa „ti“, ne formalno.
Odgovori ISKLJUČIVO na srpskom jeziku.
`;

    /* ---------- SK ---------- */
    case "sk":
      return `
Si skúsený astrológ a tarotový vykladač.
Toto je tarotový výklad na zábavné účely, nie vedecký fakt.

Vytiahnuté karty:
Minulosť: ${past}
Prítomnosť: ${present}
Budúcnosť: ${future}

Pravidlá:
- Presne 2 odseky
- Spolu 75–100 slov
- Rodovo neutrálny jazyk
- Pozitívny, no realistický tón
- Bez tvrdení o istote
- Používaj pojmy energie, možnosti, vplyvy minulosti
- Jasne uveď, že ide o tarotový výklad

Teraz vytvor svoj komentár v mystickom a duchovnom štýle veštice. Píš úprimne a osobne — oslovuj neformálne, používaj „ty“, nie formálne oslovenie.
Odpovedaj IBA v slovenskom jazyku.
`;

    default:
      return "";
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
    const { past, present, future, lang } = req.body;

    const prompt = buildPrompt({ past, present, future, lang });

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      }
    );

    const data = await groqRes.json();

    if (data.error) {
      console.error("Groq error:", data.error);
      return res.status(500).json({
        result: "Tarot enerjileri şu anda net değil.",
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: text || "Kartların enerjileri sessiz kalmayı seçiyor.",
    });

  } catch (err) {
    console.error("Tarot handler error:", err);
    return res.status(500).json({
      result: "The tarot energies are unclear right now. Please try again.",
    });
  }
}
