# AI Web Summarizer

A Manifest V3 Chrome extension that turns selected webpage text into structured Gemini summaries. The Gemini key stays in the Express backend—never in the extension.

## What it can do

- Summarize selected text from the popup or the **Summarize with AI** right-click menu.
- Choose summary length, writing style, and output language.
- Show a summary, key points, key concepts, keywords, and estimated reading time.
- Save summaries locally, search them, favorite them, copy them, delete them, and export them through Chrome's **Save as PDF** print flow.
- Persist light/dark mode and show history statistics.
- Keep Gemini calls in the Manifest V3 background service worker.

## Local setup

1. In `backend`, copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
2. Start the backend from the `backend` folder:

   ```powershell
   npm.cmd start
   ```

3. Open `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose this project folder.
4. Select text on a normal webpage, then use the extension popup or right-click and choose **Summarize with AI**.
5. Reload the extension after changing manifest, background, or extension JavaScript files.

## Architecture

```text
Selected webpage text
        ↓
Popup or context-menu service worker
        ↓
Background service worker
        ↓
Express POST /api/summarize
        ↓
Gemini API
        ↓
chrome.storage.local → popup/history/PDF export
```

The popup handles UI only. The background worker owns the context menu and backend communication, which keeps extension-wide behavior independent of whether the popup is already open.
