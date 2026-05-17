export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Hugging Face is creating a tool that democratizes AI.",
        }),
      }
    );

    const text = await response.text();

    return res.status(200).json({
      status: response.status,
      raw: text.slice(0, 300),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
