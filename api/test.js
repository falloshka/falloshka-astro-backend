export default async function handler(req, res) {
  try {
    const HF_URL = "https://api-inference.huggingface.co/models/gpt2";

    console.log("HF URL:", HF_URL);
    console.log("HF TOKEN VAR MI:", !!process.env.HF_TOKEN);

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

    const status = response.status;
    const text = await response.text();

    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // JSON değilse sorun yok, aşağıda döndürüyoruz
    }

    return res.status(200).json({
      success: true,
      debug: {
        status,
        url: HF_URL,
        tokenExists: !!process.env.HF_TOKEN,
      },
      isJson: json !== null,
      data: json,
      raw: text.substring(0, 300),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
