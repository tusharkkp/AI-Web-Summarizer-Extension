const summarizeBtn = document.getElementById("summarizeBtn");

const loading = document.getElementById("loading");
const result = document.getElementById("result");

const summary = document.getElementById("summary");
const points = document.getElementById("points");
const keywords = document.getElementById("keywords");
const readingTime = document.getElementById("readingTime");

const copyBtn = document.getElementById("copyBtn");

summarizeBtn.addEventListener("click", async () => {
  loading.hidden = false;
  result.hidden = true;

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
    async (response) => {
      if (!response || !response.selectedText) {
        loading.hidden = true;
        alert("Please select some text first.");

        return;
      }

      try {
        const aiResponse = await summarizeText(response.selectedText);

        const clean = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(clean);

        summary.textContent = parsed.summary;

        readingTime.textContent = parsed.readingTime;

        points.innerHTML = "";

        parsed.keyPoints.forEach((point) => {
          const li = document.createElement("li");

          li.textContent = point;

          points.appendChild(li);
        });

        keywords.innerHTML = "";

        parsed.keywords.forEach((word) => {
          const chip = document.createElement("span");

          chip.className = "keyword";

          chip.textContent = word;

          keywords.appendChild(chip);
        });

        loading.hidden = true;

        result.hidden = false;
      } catch (err) {
        console.error(err);

        loading.hidden = true;

        alert("Failed to generate summary.");
      }
    },
  );
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(summary.textContent);

  copyBtn.textContent = "✅ Copied!";

  setTimeout(() => {
    copyBtn.textContent = "📋 Copy Summary";
  }, 1500);
});
