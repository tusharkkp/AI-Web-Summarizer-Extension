const SETTINGS_STORAGE_KEY = "appSettings";
const DEFAULT_SETTINGS = { theme: "light" };

async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  return { ...DEFAULT_SETTINGS, ...data[SETTINGS_STORAGE_KEY] };
}

async function saveSettings(changes) {
  const settings = { ...(await getSettings()), ...changes };
  await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings });
  return settings;
}

async function applyStoredTheme() {
  const settings = await getSettings();
  document.documentElement.dataset.theme = settings.theme;
  return settings.theme;
}

async function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  await saveSettings({ theme: nextTheme });
  return nextTheme;
}
