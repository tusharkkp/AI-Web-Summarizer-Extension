const summarizeBtn = document.getElementById("summarizeBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const summary = document.getElementById("summary");
const points = document.getElementById("points");
const concepts = document.getElementById("concepts");
const keywords = document.getElementById("keywords");
const readingTime = document.getElementById("readingTime");
const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const historyBtn = document.getElementById("historyBtn");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");
const summaryLength = document.getElementById("summaryLength");
const summaryStyle = document.getElementById("summaryStyle");
const summaryLanguage = document.getElementById("summaryLanguage");

let currentSummary = null;
let toastTimeout;

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 4500);
}

function setLoading(isLoading) {
  loading.hidden = !isLoading;
  summarizeBtn.disabled = isLoading;
}

function getSummaryOptions() {
  return {
    length: summaryLength.value,
    style: summaryStyle.value,
    language: summaryLanguage.value,
  };
}

async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Could not find the active browser tab.");

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content/content.js"],
  });

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tab.id,
      { action: "GET_SELECTED_TEXT" },
      (response) => {
        if (chrome.runtime.lastError)
          return reject(new Error(chrome.runtime.lastError.message));
        resolve(response?.selectedText || "");
      },
    );
  });
}

function renderSummary(savedSummary) {
  summary.textContent = savedSummary.summary;
  readingTime.textContent = savedSummary.readingTime;
  points.replaceChildren();
  concepts.replaceChildren();
  keywords.replaceChildren();

  const savedPoints = savedSummary.keyPoints.length
    ? savedSummary.keyPoints
    : ["No key points were returned."];
  savedPoints.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    points.appendChild(item);
  });

  savedSummary.keywords.forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "keyword";
    chip.textContent = word;
    keywords.appendChild(chip);
  });

  const savedConcepts = savedSummary.keyConcepts || [];
  if (savedConcepts.length === 0) {
    concepts.hidden = true;
  } else {
    concepts.hidden = false;
    savedConcepts.forEach((concept) => {
      const conceptCard = document.createElement("article");
      const term = document.createElement("strong");
      const explanation = document.createElement("p");
      term.textContent = concept.term;
      explanation.textContent = concept.explanation;
      conceptCard.append(term, explanation);
      concepts.appendChild(conceptCard);
    });
  }

  result.hidden = false;
}

async function generateSummary(selectedText) {
  const text = selectedText.trim();
  if (!text) throw new Error("Please select some text first.");
  if (text.length > MAX_SELECTED_TEXT_LENGTH)
    throw new Error(
      `Please select fewer than ${MAX_SELECTED_TEXT_LENGTH.toLocaleString()} characters.`,
    );

  const aiResponse = await summarizeText(text, getSummaryOptions());
  const parsed = parseSummaryResponse(aiResponse);
  const savedSummary = await saveSummary({
    id: crypto.randomUUID(),
    ...parsed,
    createdAt: Date.now(),
    favorite: false,
  });
  currentSummary = savedSummary;
  renderSummary(savedSummary);
  showToast("Summary saved to history.");
}

async function summarizeSelection() {
  result.hidden = true;
  setLoading(true);
  try {
    await generateSummary(await getSelectedText());
  } catch (error) {
    console.error("Summary generation failed:", error);
    showToast(error.message || "Unable to generate a summary.", true);
  } finally {
    setLoading(false);
  }
}

async function summarizePendingSelection() {
  const data = await chrome.storage.local.get(PENDING_SELECTION_STORAGE_KEY);
  const pendingSelection = data[PENDING_SELECTION_STORAGE_KEY];
  if (!pendingSelection) return;

  await chrome.storage.local.remove(PENDING_SELECTION_STORAGE_KEY);
  await chrome.action.setBadgeText({ text: "" });
  setLoading(true);
  try {
    await generateSummary(pendingSelection);
  } catch (error) {
    console.error("Context-menu summary failed:", error);
    showToast(error.message || "Unable to summarize the selected text.", true);
  } finally {
    setLoading(false);
  }
}

summarizeBtn.addEventListener("click", summarizeSelection);
copyBtn.addEventListener("click", async () => {
  if (!currentSummary) return;
  try {
    await navigator.clipboard.writeText(
      formatSummaryForClipboard(currentSummary),
    );
    showToast("Summary copied to clipboard.");
  } catch (error) {
    console.error("Copy failed:", error);
    showToast("Could not copy the summary.", true);
  }
});
exportBtn.addEventListener("click", () => {
  if (currentSummary)
    chrome.tabs.create({
      url: chrome.runtime.getURL(
        `export/export.html?id=${encodeURIComponent(currentSummary.id)}`,
      ),
    });
});
historyBtn.addEventListener("click", () =>
  chrome.tabs.create({ url: chrome.runtime.getURL("history/history.html") }),
);
themeToggle.addEventListener("click", async () => {
  const theme = await toggleTheme();
  showToast(`${theme === "dark" ? "Dark" : "Light"} mode enabled.`);
});

applyStoredTheme().then(summarizePendingSelection);
