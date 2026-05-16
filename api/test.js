export default async function handler(req, res) {
  try {
    const HF_URL = "https://api-inference.huggingface.co/models/gpt2";

    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "Hello my name is",
      }),
    });

    const text = await response.text();

    res.status(200).json({
      success: true,
      raw: text,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
