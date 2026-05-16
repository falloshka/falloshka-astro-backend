export default async function handler(req, res) {

  // 🔥 CORS (ZORUNLU)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 PREFLIGHT SUPPORT (ÇOK KRİTİK)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message, lang } = req.body;

    const prompt = `
    You are a traditional experienced Turkish coffee fortune reader.
    User message: ${message || "No additional context"}
    The user uploaded 3 images of coffee cups after drinking Turkish coffee.
    

    Your task:
    1. Check if the cups contain visible coffee grounds (telve).
    2. If NOT, politely say that a reading cannot be performed.
    3. If YES:
      - Interpret shapes, patterns, and symbols
      - Give a mystical interpretation culturally authentic Turkish coffee reading
      - Be positive, intuitive, and future-oriented
      - Mention symbols such as: 
      bubbles (evil eye, jealousy, negative energy, being watched, attention from others), turtles (patience, protection, slow but steady success), paths (journey, new direction), hearts (love, romance), birds (news, messages), mountains (obstacles, challenges), trees (growth, stability), stars (luck, hope), keys (opportunities, solutions), rings (commitment, marriage), fish (wealth, abundance), snakes (jealousy, betrayal), suns (success, happiness), moons (mystery, intuition), ladders (career progress, achievement), ships (travel, change), flowers (joy, friendship), eyes (attention, nazar/evil eye), bridges (transition, connection), butterflies (transformation, renewal), dogs (loyalty, trusted friends), cats (independence, hidden intentions), two people turning their backs to each other (conflict, misunderstanding, distance, breakup), two people facing each other (harmony, reconciliation, communication, mutual feelings), bride in a wedding dress (commitment, engagement, new beginning, serious relationship), human figures (general meaning: relationships, social connections, support system, important people entering or influencing life), a single standing person (independence, self-focus, decision-making period), group of people (social environment, community, gossip, teamwork), a running person (change, escape from a situation, urgency), a kneeling person (apology, regret, asking for forgiveness), a child figure (new beginnings, innocence, fresh opportunities), an elderly person (wisdom, guidance, advice from someone experienced), hugging figures (reconciliation, emotional closeness, affection), hand-in-hand figures (partnership, agreement, strong bond).
      - Use symbolic storytelling like traditional coffee reading style, weaving the symbols into a narrative about the user's life and future.
      - Start the reading with a mystical opening sentence (like a traditional coffee reader)
      - Speak as if you are reading directly from the cup
      - Avoid sounding like an AI
      - End with a gentle, reflective closing sentence
      - Occasionally refer to "the cup", "the grounds", or "the symbols in the coffee"
    The tone must feel:
    - Write exactly 2 paragraphs
    - 75–100 words total
    - Intuitive
    - Mysterious
    - Symbolic
    - Emotionally engaging

    Respond ONLY in ${lang || "en"}.
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
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,
        }),
      }
    );


    if (!groqRes.ok) {
      const text = await groqRes.text();
      console.error("HTTP ERROR:", text);

      return res.status(500).json({
        result: "AI service unavailable."
      });
    }

    const data = await groqRes.json();

    if (data.error) {
      console.error("GROQ ERROR:", data.error);

      return res.status(500).json({
        result: "AI error: " + data.error.message
      });
    }


    const text = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: text || "The coffee grounds remain quiet... try again later."
    });

  }
  catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      result: "The coffee reading failed. Try again."
    });

  }
}