# Return YouTube Dislike（PC専用強化版）

## 🧭 概要

このスクリプトは、オリジナルの [Return YouTube Dislike ユーザースクリプト](https://github.com/Anarios/return-youtube-dislike/blob/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js) をベースに、**クラスベースのアーキテクチャに再構築**し、UI強化や、YouTubeの**SPA（シングルページアプリケーション）ナビゲーションへの高い信頼性**を備えた、**PC向けに特化したフォーク版**です。

本家とは異なり、本スクリプトは **PC環境専用** として設計されており、使いやすさと保守性を高める複数のモダンな機能が追加されています。

---

## ✨ 主な機能

- ✅ **YouTube Shorts の SPA ナビゲーション**に対応 — 動画切り替え後も低評価を保持して表示します。
- ✅ 通常動画の高評価・低評価ボタンの下に **比率バー**を表示（PC限定）。
- ✅ **マウスホバー時にツールチップ**で正確な評価数（高評価数 / 低評価数）を表示。
- ✅ **完全なオブジェクト指向構成（ES6クラス）**による再設計。
- ✅ **MutationObserver + タイムアウト方式の初期化**により、`yt-navigate-finish` に依存しない堅牢な構成。
- ✅ DOM要素の**キャッシュ機構**により高いパフォーマンスと効率性。
- ✅ **カスタムCSSによるスタイリング** — YouTube側のクラス名変更による破損を防止。

---

## 🚀 インストール手順

1. ユーザースクリプトマネージャーをインストール：
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. ユーザースクリプトをインストール：  
   👉 **[こちらをクリックしてインストール](https://raw.githubusercontent.com/koyasi777/return-youtube-dislike-pc-only/main/return-youtube-dislike-pc-only.user.js)**

3. YouTubeを開いて任意の動画を再生すれば、拡張された低評価表示機能が自動で有効になります。

---

## 🔄 なぜこのフォークを作ったのか？

オリジナルスクリプトも優れていますが、本バージョンでは以下の重要な改良を行いました：

| 機能                            | 本家 v3.1.5                      | 本バージョン v4.0.7                        |
|---------------------------------|----------------------------------|---------------------------------------------|
| アーキテクチャ                 | 手続き型、グローバル変数        | ES6 クラスベース、状態のカプセル化         |
| SPAナビゲーション（Shorts）     | `yt-navigate-finish` に依存      | `<title>` 監視 + タイムアウトで検知        |
| 評価表示                       | 数値のみ                        | 比率バー + ホバーツールチップ             |
| DOM処理                        | 毎回クエリ実行                  | DOM要素をキャッシュ                        |
| 非同期処理                     | `fetch().then()`                | `async/await` + `GM.xmlHttpRequest` ラップ  |
| CSSスタイリング                | YouTubeのクラスに依存           | スコープ化された独立CSS                    |
| 状態管理の信頼性               | previousState を手動で追跡       | 毎回 DOM状態を検証                         |

---

## 📄 ライセンス

このプロジェクトは、元リポジトリと同様に **GNU Affero General Public License v3.0（AGPL-3.0）** のもとでライセンスされています。

- [ライセンス全文はこちら](https://www.gnu.org/licenses/agpl-3.0.html)
- このライセンスの条件のもと、自由に使用・改変・再配布できます。

---

## 🤝 クレジット

- オリジナル作者： [Anarios](https://github.com/Anarios), [JRWR](https://github.com/JRWR)
- 改造・保守： [koyasi777](https://github.com/koyasi777)

---

## 📬 問い合わせ・コントリビュート

Pull Request や Issue はいつでも歓迎しています。  
バグ報告・機能提案・さらなるフォーク等、お気軽にご参加ください。

👉 [Issueを作成する](https://github.com/koyasi777/return-youtube-dislike-pc-only/issues)
