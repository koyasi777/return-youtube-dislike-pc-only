# Return YouTube Dislike (PC Only Mod)

## Overview

This is a **PC-focused fork** of the original [Return YouTube Dislike userscript](https://github.com/Anarios/return-youtube-dislike/blob/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js), rebuilt with enhanced reliability, UI features, and modern JavaScript architecture.

Unlike the original script (v3.1.5), this version introduces a fully **class-based design**, eliminates global state leakage, and implements several critical improvements for performance, maintainability, and UX.

---

## Key Enhancements

- ✅ **Shorts support**: Dislike data is preserved and rendered correctly even after single-page-app (SPA) navigation in Shorts.
- ✅ **Visual rating bar**: Like/dislike ratio is displayed visually under the buttons for standard videos.
- ✅ **Hover tooltip**: On mouse hover, shows the precise like/dislike count for transparency.
- ✅ **Object-oriented structure**: All logic is encapsulated in a `ReturnYouTubeDislike` class with internal state and cleanup support.
- ✅ **Robust initialization**: Uses polling with timeout and `MutationObserver` on `<title>` for consistent SPA detection (more reliable than `yt-navigate-finish`).
- ✅ **DOM caching**: Elements are queried once and cached to improve performance during rapid events.
- ✅ **Future-proof CSS**: Avoids direct dependency on brittle YouTube CSS classes by injecting isolated styles.

---

## Why a Fork?

The original script works well, but:
- It relies heavily on global variables and procedural logic, which limits extensibility.
- It lacks reliable detection for SPA transitions in Shorts.
- It doesn't offer a visual representation of like/dislike ratio, which many users find valuable.

This fork addresses those issues by rewriting the internals using modern JavaScript best practices and providing a more user-friendly interface for desktop users.

---

## License

This project is released under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html) (AGPL-3.0), in full compliance with the license of the upstream repository.
