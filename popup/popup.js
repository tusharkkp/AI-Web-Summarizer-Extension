const button = document.getElementById("testBtn");

button.addEventListener("click", async () => {
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
    {
      action: "GET_SELECTED_TEXT",
    },
    (response) => {
      if (!response) {
        alert("No response received.");
        return;
      }

      alert(response.selectedText || "No text selected.");
    },
  );
});
