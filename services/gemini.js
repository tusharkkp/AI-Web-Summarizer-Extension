async function summarizeText(text) {
  const prompt = `
You are an AI assistant.

Analyze the following text.

Return ONLY valid JSON.

{
  "summary": "...",
  "keyPoints": [
    "...",
    "...",
    "..."
  ],
  "keywords": [
    "...",
    "...",
    "..."
  ],
  "readingTime": "..."
}

Text:
${text}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
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

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
}
