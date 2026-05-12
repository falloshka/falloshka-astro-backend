/* ===============================
   DAILY CARD – PROMPT BUILDER
   =============================== */
function buildPrompt({ card, lang }) {
  switch (lang) {

    /* -------- TR -------- */
    case "tr":
      return `
Sen deneyimli bir tarot uzmanısın.
Bu bir tarot falıdır ve eğlence amaçlıdır, bilimsel bir gerçek değildir.

Bugünün kartı: ${card}

Kurallar:
- Günün genel enerjisini yorumla
- Gün boyunca öne çıkabilecek ruh hâllerini ve temaları anlat
- Olumlu ama gerçekçi ol
- Kesinlik iddiasında bulunma
- Enerjiler, ihtimaller ve eğilimler dili kullan
- Tam olarak 2 paragraf yaz
- Toplam 75–100 kelime
- Cinsiyetten bağımsız, herkese hitap et
- Bunun bir tarot falı olduğunu belirt
Yorumunu şimdi oluştur mistik ve ruhani bir falci sekilde. Yourmda samimi siz degil sen diye hitap et.
Cevabını SADECE Türkçe ver.
      `;

    /* -------- EN -------- */
    case "en":
      return `
You are an experienced tarot reader.
This is a tarot reading created for entertainment purposes only.

Card of the day: ${card}

Guidelines:
- Describe the overall energy of the day
- Mention emotional or situational themes that may emerge
- Be positive but realistic
- Avoid claims of certainty
- Use the language of energies, tendencies, and possibilities
- Write exactly 2 paragraphs
- 75–100 words total
- Use gender-neutral language
- Clearly state that this is a tarot reading
Create your comment now in a mystical and spiritual fortune teller style. Write warmly and personally — use “you” informally, not formally.

Respond ONLY in English.
      `;

    /* -------- DE -------- */
    case "de":
      return `
Du bist eine erfahrene Tarot-Expertin.
Dies ist eine Tarot-Lesung zu Unterhaltungszwecken.

Karte des Tages: ${card}

Regeln:
- Beschreibe die Tagesenergie
- Gehe auf mögliche Emotionen und Situationen ein
- Positiv, aber realistisch formulieren
- Keine absoluten Vorhersagen machen
- Mit Energien, Tendenzen und Möglichkeiten arbeiten
- Genau 2 Absätze
- Insgesamt 75–100 Wörter
- Geschlechtsneutral schreiben
- Klar als Tarot-Lesung kennzeichnen
Erschaffe jetzt deinen Kommentar in einer mystischen und spirituellen Wahrsager-Art. Schreib herzlich und persönlich — sprich nicht mit „Sie“, sondern mit „du“.

Antworte AUSSCHLIESSLICH auf Deutsch.
      `;

    /* -------- SR -------- */
    case "sr":
      return `
Ti si iskusan tarot tumač.
Ovo je tarot tumačenje namenjeno isključivo zabavi.

Karta dana: ${card}

Pravila:
- Opiši energiju dana
- Govori o mogućim emocijama ili situacijama
- Pozitivno, ali realistično
- Bez tvrdnji o apsolutnoj sigurnosti
- Koristi izraze poput energije, tendencije i mogućnosti
- Tačno 2 pasusa
- Ukupno 75–100 reči
- Rodno neutralan jezik
- Jasno navedi da je u pitanju tarot tumačenje
Sada napravi svoj komentar u mističnom i duhovnom stilu proroka. Piši iskreno i prisno — obraćaj se sa „ti“, ne formalno.

Odgovori ISKLJUČIVO na srpskom jeziku.
      `;

    /* -------- SK -------- */
    case "sk":
      return `
Si skúsený tarotový vykladač.
Toto je tarotový výklad na zábavné účely.

Karta dňa: ${card}

Pravidlá:
- Opíš energiu dnešného dňa
- Spomeň možné emócie alebo situácie
- Buď pozitívny, ale realistický
- Vyhýbaj sa absolútnym tvrdeniam
- Používaj jazyk energií, tendencií a možností
- Presne 2 odseky
- Spolu 75–100 slov
- Rodovo neutrálny jazyk
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
    const { card, lang } = req.body;

    const prompt = buildPrompt({ card, lang });

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
      console.error("Groq daily tarot error:", data.error);
      return res.status(500).json({
        result: "Bugünün tarot enerjileri şu anda net değil.",
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: text || "Bugünün enerjileri sessiz kalmayı seçiyor.",
    });

  } catch (err) {
    console.error("Daily tarot handler error:", err);
    return res.status(500).json({
      result: "The daily tarot energy is unclear right now.",
    });
  }
}
