const summarizeBtn = document.getElementById("summarizeBtn");
const result = document.getElementById("result");

summarizeBtn.addEventListener("click", async () => {
  result.textContent = "Reading selected text...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  await chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    files: ["content/content.js"],
  });

  chrome.tabs.sendMessage(
    tab.id,
    { action: "GET_SELECTED_TEXT" },
    async (response) => {
      if (!response || !response.selectedText) {
        result.textContent = "Please select some text first.";
        return;
      }

      result.textContent = "Generating summary...";

      try {
        const summary = await summarizeText(response.selectedText);

        result.textContent = summary;
      } catch (error) {
        console.error(error);

        result.textContent = "Failed to generate summary.";
      }
    },
  );
});
