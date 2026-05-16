export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Hello my name is",
        }),
      }
    );

    const data = await response.json();

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
