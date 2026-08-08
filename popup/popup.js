const summarizeBtn = document.getElementById("summarizeBtn");

const loading = document.getElementById("loading");
const result = document.getElementById("result");

const summary = document.getElementById("summary");
const points = document.getElementById("points");
const keywords = document.getElementById("keywords");
const readingTime = document.getElementById("readingTime");

const copyBtn = document.getElementById("copyBtn");
const historyBtn = document.getElementById("historyBtn");

summarizeBtn.addEventListener("click", async () => {
  loading.hidden = false;
  result.hidden = true;

  try {
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
        try {
          if (!response || !response.selectedText) {
            loading.hidden = true;

            alert("Please select some text first.");

            return;
          }

          const aiResponse = await summarizeText(response.selectedText);

          console.log("Raw Gemini Response:");
          console.log(aiResponse);

          // -------- Extract JSON safely --------

          const start = aiResponse.indexOf("{");
          const end = aiResponse.lastIndexOf("}");

          if (start === -1 || end === -1) {
            throw new Error("Gemini did not return valid JSON.");
          }

          const jsonString = aiResponse.substring(start, end + 1);

          console.log("Extracted JSON:");
          console.log(jsonString);

          const parsed = JSON.parse(jsonString);

          // -------- Save History --------

          await saveSummary({
            id: crypto.randomUUID(),

            summary: parsed.summary,

            keyPoints: parsed.keyPoints,

            keywords: parsed.keywords,

            readingTime: parsed.readingTime,

            createdAt: Date.now(),

            favorite: false,
          });

          // -------- UI --------

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

          alert(err.message);
        }
      },
    );
  } catch (err) {
    console.error(err);

    loading.hidden = true;

    alert(err.message);
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(summary.textContent);

  copyBtn.textContent = "✅ Copied!";

  setTimeout(() => {
    copyBtn.textContent = "📋 Copy Summary";
  }, 1500);
});

historyBtn.addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("history/history.html"),
  });
});
