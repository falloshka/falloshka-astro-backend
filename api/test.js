export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Hello world"
        }),
      }
    );

    const text = await response.text();

    // ✅ parse safe
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: "HF JSON dönmedi",
        raw: text.slice(0, 300),
      });
    }

    // ✅ STATUS CHECK
    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: "HF responded with error",
        raw: data,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
