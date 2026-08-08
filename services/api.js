async function summarizeText(text, options = {}) {
  if (!text?.trim()) {
    throw new Error("Please select some text first.");
  }

  let response;

  try {
    response = await chrome.runtime.sendMessage({
      type: "SUMMARIZE_TEXT",
      text,
      options,
    });
  } catch (error) {
    console.error("Could not communicate with the background service worker:", error);
    throw new Error("Could not connect to the extension background service. Reload the extension and try again.");
  }

  if (!response?.success) {
    throw new Error(response?.message || "The extension could not generate a summary.");
  }

  return response.result;
}
