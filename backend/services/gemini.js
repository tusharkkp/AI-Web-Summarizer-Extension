export async function summarize(text) {
  if (!text?.trim()) {
    throw new Error("Text is required to generate a summary.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from backend/.env.");
  }

  const prompt = `
You are an AI assistant.

Return ONLY valid JSON.

{
  "summary": "",
  "keyPoints": [],
  "keywords": [],
  "readingTime": ""
}

Text:
${text}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  let response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Gemini request could not be sent:", error.cause?.code || error.message);
    throw new Error("Could not reach the Gemini API. Check the backend internet connection or firewall settings.");
  }

  const data = await response.json().catch(() => null);

  console.log("Gemini response status:", response.status);

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API error.");
  }

  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!result?.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  return result;
}
