function parseSummaryResponse(aiResponse) {
  if (typeof aiResponse !== "string" || !aiResponse.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  const start = aiResponse.indexOf("{");
  const end = aiResponse.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Gemini did not return summary JSON.");
  }

  let parsed;

  try {
    parsed = JSON.parse(aiResponse.slice(start, end + 1));
  } catch {
    throw new Error("Gemini returned malformed summary JSON.");
  }

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new Error("Gemini returned a summary without text.");
  }

  return {
    summary: parsed.summary.trim(),
    keyPoints: Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.filter((point) => typeof point === "string" && point.trim()).map((point) => point.trim())
      : [],
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((keyword) => typeof keyword === "string" && keyword.trim()).map((keyword) => keyword.trim())
      : [],
    keyConcepts: Array.isArray(parsed.keyConcepts)
      ? parsed.keyConcepts
        .filter((concept) => typeof concept?.term === "string" && concept.term.trim() && typeof concept?.explanation === "string" && concept.explanation.trim())
        .map((concept) => ({ term: concept.term.trim(), explanation: concept.explanation.trim() }))
      : [],
    readingTime: typeof parsed.readingTime === "string" && parsed.readingTime.trim()
      ? parsed.readingTime.trim()
      : "Not available",
  };
}

function formatSummaryForClipboard(summary) {
  return [
    "Summary",
    summary.summary,
    "",
    "Key Points",
    ...(summary.keyPoints || []).map((point) => `• ${point}`),
    "",
    "Keywords",
    (summary.keywords || []).join(", "),
    "",
    "Key Concepts",
    ...(summary.keyConcepts || []).map((concept) => `${concept.term}: ${concept.explanation}`),
    "",
    `Reading Time: ${summary.readingTime}`,
  ].join("\n");
}

function formatSummaryDate(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
