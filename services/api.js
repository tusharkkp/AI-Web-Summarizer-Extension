async function summarizeText(text) {
  if (!text?.trim()) {
    throw new Error("Please select some text first.");
  }

  let response;

  try {
    response = await fetch("http://localhost:3000/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    });
  } catch (error) {
    console.error("Could not reach the backend:", error);
    throw new Error("Could not connect to the backend. Make sure it is running on port 3000.");
  }

  const data = await response.json().catch(() => null);

  console.log("Backend status:", response.status);
  console.log("Backend response:", data);

  if (!response.ok) {
    throw new Error(data?.message || `Backend request failed (HTTP ${response.status}).`);
  }

  if (!data?.result) {
    throw new Error("The backend returned an empty summary.");
  }

  return data.result;
}
