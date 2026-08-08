const STORAGE_KEY = "summaryHistory";

async function getHistory() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

async function saveSummary(summaryObject) {
  const history = await getHistory();
  history.unshift(summaryObject);
  await chrome.storage.local.set({ [STORAGE_KEY]: history });
  return summaryObject;
}

async function deleteSummary(id) {
  const history = (await getHistory()).filter((item) => item.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: history });
  return history;
}

async function toggleFavorite(id) {
  const history = await getHistory();
  const summary = history.find((item) => item.id === id);

  if (summary) {
    summary.favorite = !summary.favorite;
    await chrome.storage.local.set({ [STORAGE_KEY]: history });
  }

  return summary || null;
}

async function getSummaryById(id) {
  return (await getHistory()).find((item) => item.id === id) || null;
}

async function getHistoryStats() {
  const history = await getHistory();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    total: history.length,
    favorites: history.filter((item) => item.favorite).length,
    thisWeek: history.filter((item) => item.createdAt >= weekAgo).length,
  };
}
