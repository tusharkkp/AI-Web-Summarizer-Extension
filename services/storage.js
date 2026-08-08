const STORAGE_KEY = "summaryHistory";

async function getHistory() {
  const data = await chrome.storage.local.get(STORAGE_KEY);

  return data[STORAGE_KEY] || [];
}

async function saveSummary(summaryObject) {
  const history = await getHistory();

  history.unshift(summaryObject);

  await chrome.storage.local.set({
    [STORAGE_KEY]: history,
  });
}

async function deleteSummary(id) {
  let history = await getHistory();

  history = history.filter((item) => item.id !== id);

  await chrome.storage.local.set({
    [STORAGE_KEY]: history,
  });
}

async function toggleFavorite(id) {
  const history = await getHistory();

  history.forEach((item) => {
    if (item.id === id) {
      item.favorite = !item.favorite;
    }
  });

  await chrome.storage.local.set({
    [STORAGE_KEY]: history,
  });
}
