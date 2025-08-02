// ==UserScript==
// @name         Return YouTube Dislike (PC Only)
// @name:ja      Return YouTube Dislike（PC専用改良版）
// @namespace    https://github.com/koyasi777/return-youtube-dislike-pc-only
// @homepage     https://github.com/koyasi777/return-youtube-dislike-pc-only
// @version      4.0.7
// @encoding     utf-8
// @description  Desktop-only fork of Return YouTube Dislike. Adds Shorts SPA support, visual like/dislike ratio bar, and a class-based architecture.
// @description:ja  デスクトップ専用に改良した Return YouTube Dislike。Shorts対応、評価バー表示、クラスベース設計を追加。
// @icon         https://github.com/Anarios/return-youtube-dislike/raw/main/Icons/Return%20Youtube%20Dislike%20-%20Transparent.png
// @author       Anarios & JRWR (original), koyasi777 (mod)
// @license      AGPL-3.0-only
// @licenseURL   https://www.gnu.org/licenses/agpl-3.0.html
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @compatible   chrome
// @compatible   firefox
// @compatible   opera
// @compatible   safari
// @compatible   edge
// @downloadURL  https://koyasi777.github.io/return-youtube-dislike-pc-only/return-youtube-dislike-pc-only.user.js
// @updateURL    https://koyasi777.github.io/return-youtube-dislike-pc-only/return-youtube-dislike-pc-only.user.js
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @connect      youtube.com
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /**
     * @class ReturnYouTubeDislike
     * Encapsulates all logic for the Return YouTube Dislike userscript.
     */
    class ReturnYouTubeDislike {
        // --- Static Properties for Configuration and Constants ---

        static config = {
            disableLogging: true,
            coloredThumbs: false,
            coloredBar: false,
            colorTheme: "classic",
            numberDisplayFormat: "compactShort",
            numberDisplayRoundDown: true,
            tooltipPercentageMode: "none",
            numberDisplayReformatLikes: false,
            rateBarEnabled: true,
        };

        static API_URL = 'https://returnyoutubedislikeapi.com/votes?videoId=';

        static VOTE_STATE = { LIKED: 1, DISLIKED: 2, NEUTRAL: 3 };

        // 🚀 [MODIFICATION] Define custom styles for the tooltip to ensure consistency.
        static STYLES = `
            #return-youtube-dislike-bar-container {
                background: var(--yt-spec-icon-disabled);
                border-radius: 2px;
            }
            #return-youtube-dislike-bar {
                background: var(--yt-spec-text-primary);
                border-radius: 2px;
                transition: all 0.15s ease-in-out;
            }
            .ryd-tooltip {
                position: absolute;
                display: block;
                height: 1.5px;
                bottom: -10px;
            }
            #ryd-dislike-tooltip {
                visibility: hidden;
                opacity: 0;
                transition: opacity 0.15s ease-in-out;
                /* --- Custom Tooltip Styles --- */
                background-color: #616161; /* Standard YouTube tooltip background */
                color: #fff;
                padding: 8px;
                border-radius: 2px;
                font-size: 12px;
                text-align: center;
            }
            .ryd-tooltip:hover #ryd-dislike-tooltip {
                visibility: visible;
                opacity: 1;
            }
            .ryd-tooltip-bar-container {
                width: 100%;
                height: 2px;
                position: absolute;
                padding-top: 6px;
                padding-bottom: 12px;
                top: -6px;
            }
            ytd-menu-renderer.ytd-watch-metadata {
                overflow-y: visible !important;
            }
            #top-level-buttons-computed {
                position: relative !important;
            }
        `;

        // --- Instance Properties ---
        videoId = null;
        likes = 0;
        dislikes = 0;
        previousState = ReturnYouTubeDislike.VOTE_STATE.NEUTRAL;
        isMobile = window.location.hostname === 'm.youtube.com';
        domCache = {};
        mutationObservers = [];

        constructor() {
            this.log('Instance created.');
            this.injectStyles();
            this.initializeNavigationObserver();
            this.run();
        }

        initializeNavigationObserver() {
            this.log('Setting up SPA navigation observer.');
            const observerCallback = () => {
                this.log('Navigation detected by title change. Re-initializing script.');
                setTimeout(() => this.run(), 500);
            };
            const titleElement = document.head.querySelector('title');
            if (titleElement) {
                const navigationObserver = new MutationObserver(observerCallback);
                navigationObserver.observe(titleElement, { childList: true });
            } else {
                this.logError('Could not find <title> element. Falling back to "yt-navigate-finish" event.');
                window.addEventListener('yt-navigate-finish', observerCallback);
            }
        }

        run() {
            const pollingInterval = 100;
            const timeout = 10000;
            let timeElapsed = 0;
            this.cleanup();
            const intervalId = setInterval(() => {
                timeElapsed += pollingInterval;
                const videoId = this.getVideoId();
                const buttons = this.getButtons();
                if (videoId && buttons) {
                    clearInterval(intervalId);
                    this.main(videoId, buttons);
                } else if (timeElapsed > timeout) {
                    clearInterval(intervalId);
                    this.log('Initialization timed out.');
                }
            }, pollingInterval);
        }

        async main(videoId, buttons) {
            if (videoId === this.videoId) {
                this.log('Already processed this video, or re-run on same page. Skipping.');
                return;
            }
            this.videoId = videoId;
            this.log(`Processing video ID: ${this.videoId}`);

            if (!this.cacheDomElements(buttons)) {
                this.logError('Required DOM elements not found. Aborting.');
                return;
            }

            try {
                const data = await this.fetchVotes();
                this.dislikes = data.dislikes;

                const nativeLikes = this.getNativeLikeCount();
                if (nativeLikes !== null) {
                    this.log(`Using native like count (${nativeLikes}) instead of API count (${data.likes}).`);
                    this.likes = nativeLikes;
                } else {
                    this.log(`Could not find native like count, falling back to API count (${data.likes}).`);
                    this.likes = data.likes;
                }

                this.previousState = this.getInitialVoteState();
                this.updateUI();
                this.setupEventListeners();
                this.setupMutationObservers();
                this.log('Initialization complete.');
            } catch (error) {
                this.logError('Failed to fetch or process votes.', error);
            }
        }

        cleanup() {
            this.log('Cleaning up previous instance.');
            this.mutationObservers.forEach(observer => observer.disconnect());
            this.mutationObservers = [];
            this.domCache = {};
            this.videoId = null;
        }

        async fetchVotes() {
            this.log('Fetching votes...');
            return new Promise((resolve, reject) => {
                GM.xmlHttpRequest({
                    method: 'GET',
                    url: `${ReturnYouTubeDislike.API_URL}${this.videoId}`,
                    onload: (response) => {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                const data = JSON.parse(response.responseText);
                                if (data && typeof data.dislikes !== 'undefined') {
                                    this.log(`Received counts: ${data.dislikes} dislikes, ${data.likes} likes.`);
                                    resolve(data);
                                } else { reject(new Error('Invalid API response format.')); }
                            } catch (e) { reject(new Error('Failed to parse API response.')); }
                        } else { reject(new Error(`API request failed with status: ${response.status}`)); }
                    },
                    onerror: (error) => reject(error),
                    ontimeout: () => reject(new Error('API request timed out.')),
                    timeout: 15000,
                });
            });
        }

        getInitialVoteState() {
            const likeButton = this.domCache.likeButton;
            const dislikeButton = this.domCache.dislikeButton;
            if (likeButton?.classList.contains('style-default-active') || likeButton?.getAttribute('aria-pressed') === 'true') {
                return ReturnYouTubeDislike.VOTE_STATE.LIKED;
            }
            if (dislikeButton?.classList.contains('style-default-active') || dislikeButton?.getAttribute('aria-pressed') === 'true') {
                return ReturnYouTubeDislike.VOTE_STATE.DISLIKED;
            }
            return ReturnYouTubeDislike.VOTE_STATE.NEUTRAL;
        }

        getNativeLikeCount() {
            if (!this.domCache.likeButton) return null;
            try {
                const buttonElement = this.domCache.likeButton.querySelector('button') || this.domCache.likeButton;
                const ariaLabel = buttonElement.getAttribute('aria-label');
                if (!ariaLabel) return null;
                const nativeLikesStr = ariaLabel.replace(/\D/g, '');
                if (nativeLikesStr) {
                    return parseInt(nativeLikesStr, 10);
                }
            } catch (error) {
                this.logError('Could not parse native like count from aria-label.', error);
            }
            return null;
        }

        updateUI() {
            this.updateDislikeCount();
            if (ReturnYouTubeDislike.config.numberDisplayReformatLikes) {
                this.updateLikeCount();
            }
            if (ReturnYouTubeDislike.config.rateBarEnabled) {
                this.createOrUpdateRateBar();
            }
            if (ReturnYouTubeDislike.config.coloredThumbs) {
                this.applyThumbColors();
            }
        }

        updateDislikeCount() {
            if (!this.domCache.dislikeText) return;
            this.domCache.dislikeText.textContent = this.formatNumber(this.dislikes);
        }

        updateLikeCount() {
            if (!this.domCache.likeText) return;
            this.domCache.likeText.textContent = this.formatNumber(this.likes);
        }

        createOrUpdateRateBar() {
            const container = this.domCache.buttons;
            if (!container || this.isMobile || this.isShorts()) return;

            let rateBarContainer = document.getElementById('return-youtube-dislike-bar-container');
            const totalVotes = this.likes + this.dislikes;
            const likePercentage = totalVotes > 0 ? (this.likes / totalVotes) * 100 : 50;
            const likeButtonWidth = this.domCache.likeButton?.clientWidth || 0;
            const dislikeButtonWidth = this.domCache.dislikeButton?.clientWidth || 52;
            const totalWidth = likeButtonWidth + dislikeButtonWidth;

            if (totalWidth === 0) return;

            if (!rateBarContainer) {
                const tooltipHtml = this.getTooltipHtml(likePercentage);
                const colorLikeStyle = ReturnYouTubeDislike.config.coloredBar ? `background-color: ${this.getColor(true)};` : '';
                const colorDislikeStyle = ReturnYouTubeDislike.config.coloredBar ? `background-color: ${this.getColor(false)};` : '';
                // 🚀 [MODIFICATION] Removed volatile YouTube classes from the tooltip element.
                const barHtml = `
                    <div class="ryd-tooltip" style="width: ${totalWidth}px">
                        <div class="ryd-tooltip-bar-container">
                            <div id="return-youtube-dislike-bar-container" style="width: 100%; height: 2px; ${colorDislikeStyle}">
                                <div id="return-youtube-dislike-bar" style="width: ${likePercentage}%; height: 100%; ${colorLikeStyle}"></div>
                            </div>
                        </div>
                        <tp-yt-paper-tooltip position="top" id="ryd-dislike-tooltip" role="tooltip" tabindex="-1">
                            ${tooltipHtml}
                        </tp-yt-paper-tooltip>
                    </div>`;
                container.insertAdjacentHTML('beforeend', barHtml);
            } else {
                document.querySelector('.ryd-tooltip').style.width = `${totalWidth}px`;
                document.getElementById('return-youtube-dislike-bar').style.width = `${likePercentage}%`;
                document.getElementById('ryd-dislike-tooltip').innerHTML = this.getTooltipHtml(likePercentage);
                if (ReturnYouTubeDislike.config.coloredBar) {
                    rateBarContainer.style.backgroundColor = this.getColor(false);
                    document.getElementById('return-youtube-dislike-bar').style.backgroundColor = this.getColor(true);
                }
            }
        }

        applyThumbColors() {
            if (this.isShorts()) {
                const shortLikeButton = this.domCache.likeButton?.querySelector("tp-yt-paper-button#button");
                const shortDislikeButton = this.domCache.dislikeButton?.querySelector("tp-yt-paper-button#button");
                if (shortLikeButton?.getAttribute("aria-pressed") === "true") shortLikeButton.style.color = this.getColor(true);
                if (shortDislikeButton?.getAttribute("aria-pressed") === "true") shortDislikeButton.style.color = this.getColor(false);
            } else {
                if (this.domCache.likeButton) this.domCache.likeButton.style.color = this.getColor(true);
                if (this.domCache.dislikeButton) this.domCache.dislikeButton.style.color = this.getColor(false);
            }
        }

        setupEventListeners() {
            this.log('Registering button listeners...');
            this.domCache.likeButton.addEventListener('click', this.handleVoteClick.bind(this));
            this.domCache.dislikeButton.addEventListener('click', this.handleVoteClick.bind(this));
        }

        handleVoteClick() {
            if (!this.isUserLoggedIn()) return;
            setTimeout(() => {
                const newState = this.getInitialVoteState();
                if (newState === this.previousState) return;

                if (newState === ReturnYouTubeDislike.VOTE_STATE.LIKED) {
                    this.likes++;
                    if (this.previousState === ReturnYouTubeDislike.VOTE_STATE.DISLIKED) this.dislikes--;
                } else if (newState === ReturnYouTubeDislike.VOTE_STATE.DISLIKED) {
                    this.dislikes++;
                    if (this.previousState === ReturnYouTubeDislike.VOTE_STATE.LIKED) this.likes--;
                } else if (newState === ReturnYouTubeDislike.VOTE_STATE.NEUTRAL) {
                    if (this.previousState === ReturnYouTubeDislike.VOTE_STATE.LIKED) this.likes--;
                    if (this.previousState === ReturnYouTubeDislike.VOTE_STATE.DISLIKED) this.dislikes--;
                }

                this.previousState = newState;
                this.updateUI();
            }, 100);
        }

        setupMutationObservers() {
            if (this.isShorts() && ReturnYouTubeDislike.config.coloredThumbs) {
                const shortsObserver = new MutationObserver((mutationList) => {
                    for (const mutation of mutationList) {
                        if (mutation.type === "attributes") {
                            const isPressed = mutation.target.getAttribute("aria-pressed") === "true";
                            mutation.target.style.color = isPressed ? this.getColor(mutation.target.closest('ytd-like-button-renderer')) : 'unset';
                        }
                    }
                });
                const likePaperButton = this.domCache.likeButton.querySelector('tp-yt-paper-button#button');
                const dislikePaperButton = this.domCache.dislikeButton.querySelector('tp-yt-paper-button#button');
                if (likePaperButton) shortsObserver.observe(likePaperButton, { attributes: true, attributeFilter: ['aria-pressed'] });
                if (dislikePaperButton) shortsObserver.observe(dislikePaperButton, { attributes: true, attributeFilter: ['aria-pressed'] });
                this.mutationObservers.push(shortsObserver);
            }
        }

        cacheDomElements(buttonsContainer) {
            this.log('Caching DOM elements...');
            this.domCache.buttons = buttonsContainer;
            const likeSelector = this.isShorts() ? '#like-button' : 'ytd-segmented-like-dislike-button-renderer #like-button, ytd-toggle-button-renderer:first-of-type, like-button-view-model';
            const dislikeSelector = this.isShorts() ? '#dislike-button' : 'ytd-segmented-like-dislike-button-renderer #dislike-button, ytd-toggle-button-renderer:nth-of-type(2), dislike-button-view-model';
            this.domCache.likeButton = this.domCache.buttons.querySelector(likeSelector);
            this.domCache.dislikeButton = this.domCache.buttons.querySelector(dislikeSelector);
            if (!this.domCache.likeButton || !this.domCache.dislikeButton) return false;
            this.domCache.likeText = this.domCache.likeButton.querySelector('#text, .yt-spec-button-shape-next__button-text-content');
            this.domCache.dislikeText = this.domCache.dislikeButton.querySelector('#text, .yt-spec-button-shape-next__button-text-content');
            if (!this.domCache.dislikeText) {
                let dislikeButtonInner = this.domCache.dislikeButton.querySelector('button') || this.domCache.dislikeButton;
                if (dislikeButtonInner.querySelector('#text')) return true;
                let textSpan = document.createElement('span');
                textSpan.id = 'text';
                if (!this.isShorts()) {
                    textSpan.style.marginLeft = '6px';
                    dislikeButtonInner.style.width = 'auto';
                }
                dislikeButtonInner.appendChild(textSpan);
                this.domCache.dislikeText = textSpan;
            }
            return true;
        }

        getButtons() {
            if (this.isShorts()) {
                for (let element of document.querySelectorAll("#actions.ytd-reel-player-overlay-renderer")) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top > 0 && rect.bottom < window.innerHeight) {
                        return element;
                    }
                }
                return document.querySelector("#actions.ytd-reel-player-overlay-renderer");
            }
            return document.querySelector("#menu-container #top-level-buttons-computed, ytd-menu-renderer.ytd-watch-metadata > div");
        }

        // --- Utility Methods ---
        log(text, subtext = '') { if (!ReturnYouTubeDislike.config.disableLogging) { console.log(`[RYD] ${text}`, subtext); } }
        logError(text, error) { console.error(`[RYD] ERROR: ${text}`, error || ''); }
        injectStyles() { GM_addStyle(ReturnYouTubeDislike.STYLES); }
        getVideoId() {
            const url = new URL(window.location.href);
            if (url.pathname.startsWith('/shorts/')) return url.pathname.substring(8);
            if (url.pathname.startsWith('/clip/')) return document.querySelector("meta[itemprop='videoId']")?.content || null;
            return url.searchParams.get('v');
        }
        isShorts() { return window.location.pathname.startsWith('/shorts'); }
        isUserLoggedIn() { return !this.isMobile && document.querySelector("#avatar-btn") !== null; }
        formatNumber(number) {
            const num = ReturnYouTubeDislike.config.numberDisplayRoundDown ? this.roundDown(number) : number;
            return this.getNumberFormatter().format(num);
        }
        roundDown(num) {
            if (num < 1000) return num;
            const int = Math.floor(Math.log10(num) - 2);
            const decimal = int + (int % 3 ? 1 : 0);
            return Math.floor(num / 10 ** decimal) * 10 ** decimal;
        }
        getNumberFormatter() {
            const locale = document.documentElement.lang || navigator.language || 'en';
            const options = {
                'compactShort': { notation: 'compact', compactDisplay: 'short' },
                'compactLong': { notation: 'compact', compactDisplay: 'long' },
                'standard': { notation: 'standard' }
            };
            return new Intl.NumberFormat(locale, options[ReturnYouTubeDislike.config.numberDisplayFormat] || options.compactShort);
        }
        getTooltipHtml(likePercentage) {
            const dislikePercentage = 100 - likePercentage;
            const likesFormatted = this.likes.toLocaleString();
            const dislikesFormatted = this.dislikes.toLocaleString();
            switch (ReturnYouTubeDislike.config.tooltipPercentageMode) {
                case 'dash_like': return `${likesFormatted} / ${dislikesFormatted} - ${likePercentage.toFixed(1)}%`;
                case 'dash_dislike': return `${likesFormatted} / ${dislikesFormatted} - ${dislikePercentage.toFixed(1)}%`;
                case 'both': return `${likePercentage.toFixed(1)}% / ${dislikePercentage.toFixed(1)}%`;
                case 'only_like': return `${likePercentage.toFixed(1)}%`;
                case 'only_dislike': return `${dislikePercentage.toFixed(1)}%`;
                default: return `${likesFormatted} / ${dislikesFormatted}`;
            }
        }
        getColor(isLike) {
            const themes = {
                classic: { like: 'lime', dislike: 'red' },
                accessible: { like: 'dodgerblue', dislike: 'gold' },
                neon: { like: 'aqua', dislike: 'magenta' }
            };
            const theme = themes[ReturnYouTubeDislike.config.colorTheme] || themes.classic;
            return isLike ? theme.like : theme.dislike;
        }
    }

    new ReturnYouTubeDislike();

})();
