# Return YouTube Dislike (PC Only)

## 🧭 Overview

This is a **desktop-focused fork** of the original [Return YouTube Dislike userscript](https://github.com/Anarios/return-youtube-dislike/blob/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js), rebuilt with a class-based architecture, enhanced UI elements, and greater reliability for Single Page Application (SPA) navigation on YouTube.

Unlike the original script, this version is designed **only for PC** environments, and adds several modern features to improve usability and maintainability.

---

## ✨ Key Features

- ✅ Supports **Shorts SPA navigation** — dislikes remain visible after switching videos.
- ✅ Displays a **like/dislike ratio bar** under the buttons (desktop only).
- ✅ **Hover tooltip** shows accurate like/dislike counts.
- ✅ Fully **object-oriented** codebase (ES6 class).
- ✅ **MutationObserver + timeout-based** initialization — more robust than relying on `yt-navigate-finish`.
- ✅ **DOM element caching** for performance and efficiency.
- ✅ Custom CSS styling — avoids breaking due to YouTube class name changes.

---

## 🚀 Installation Guide

1. Install a userscript manager:
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. Install the userscript:  
   👉 **[Click here to install](https://raw.githubusercontent.com/koyasi777/return-youtube-dislike-pc-only/main/return-youtube-dislike-pc-only.user.js)**

3. Visit YouTube and open any video — the enhanced dislike interface will activate automatically.

---

## 🔄 Why This Fork?

The original userscript is great, but this version introduces key improvements:

| Feature                        | Original v3.1.5                | This Version (v4.0.7)                        |
|--------------------------------|--------------------------------|---------------------------------------------|
| Architecture                  | Procedural, global variables   | ES6 class-based, encapsulated state         |
| SPA Navigation (Shorts)       | Relies on `yt-navigate-finish` | Uses `<title>` mutation + timeout fallback  |
| Rating Display                | Text-only                      | Visual ratio bar with hover tooltip         |
| DOM Handling                  | Repeated queries               | Cached DOM elements                         |
| Asynchronous Code             | `fetch().then()`               | `async/await` with GM.xmlHttpRequest wrapper|
| CSS Styling                   | Tied to YouTube classes        | Fully isolated and scoped CSS               |
| State Reliability             | Tracks previousState manually  | Checks actual DOM state per event           |

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0), in accordance with the upstream repository.

- [License text](https://www.gnu.org/licenses/agpl-3.0.html)
- You are free to use, modify, and distribute under the terms of this license.

---

## 🤝 Attribution

- Original Authors: [Anarios](https://github.com/Anarios), [JRWR](https://github.com/JRWR)
- Modified and maintained by: [koyasi777](https://github.com/koyasi777)

---

## 📬 Issues / Contributions

Pull requests and issues are welcome!  
Please feel free to report bugs, request features, or fork this further.

👉 [Open an issue](https://github.com/koyasi777/return-youtube-dislike-pc-only/issues)

