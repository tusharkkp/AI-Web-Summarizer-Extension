const printDocument = document.getElementById("printDocument");
const errorMessage = document.getElementById("error");
const printBtn = document.getElementById("printBtn");

async function loadExport() {
  const id = new URLSearchParams(window.location.search).get("id");
  const savedSummary = id ? await getSummaryById(id) : null;
  if (!savedSummary) {
    errorMessage.textContent = "This saved summary could not be found.";
    errorMessage.hidden = false;
    return;
  }

  document.getElementById("createdAt").textContent = formatSummaryDate(
    savedSummary.createdAt,
  );
  document.getElementById("summary").textContent = savedSummary.summary;
  document.getElementById("readingTime").textContent = savedSummary.readingTime;
  const points = document.getElementById("points");
  points.replaceChildren(
    ...(savedSummary.keyPoints || []).map((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      return item;
    }),
  );
  const concepts = savedSummary.keyConcepts || [];
  document.getElementById("conceptSection").hidden = concepts.length === 0;
  document.getElementById("concepts").replaceChildren(
    ...concepts.map((concept) => {
      const item = document.createElement("li");
      item.textContent = `${concept.term}: ${concept.explanation}`;
      return item;
    }),
  );
  const keywords = document.getElementById("keywords");
  keywords.replaceChildren(
    ...savedSummary.keywords.map((keyword) => {
      const chip = document.createElement("span");
      chip.textContent = keyword;
      return chip;
    }),
  );
  printDocument.hidden = false;
}

printBtn.addEventListener("click", () => window.print());
loadExport();
