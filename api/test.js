import https from "https";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    const data = JSON.stringify({
      inputs: "Hello my name is",
    });

    const options = {
      hostname: "api-inference.huggingface.co",
      path: "/models/gpt2",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const hfReq = https.request(options, (hfRes) => {
      let body = "";

      hfRes.on("data", (chunk) => {
        body += chunk;
      });

      hfRes.on("end", () => {
        res.status(200).json({
          success: true,
          raw: body.slice(0, 300),
        });
      });
    });

    hfReq.on("error", (error) => {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    });

    hfReq.write(data);
    hfReq.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
