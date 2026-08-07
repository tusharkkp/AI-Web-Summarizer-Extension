async function summarizeText(text) {
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
              text: `Summarize the following text in simple bullet points:

${text}`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
}
