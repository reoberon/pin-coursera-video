// ==UserScript==
// @name         Pin Coursera Video
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  Add a button to pin coursera video plyer on the page when scrolling down the page to see more content.
// @author       reoberon
// @match        https://www.coursera.org/learn/*/lecture/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/reoberon/pin-coursera-video/main/index.js
// @downloadURL  https://raw.githubusercontent.com/reoberon/pin-coursera-video/main/index.js
// ==/UserScript==

const player = '[aria-label="Video Player"]';
const innerContainer = '[data-testid="inner-container"]';
const outerContainer = '[data-testid="outer-container"]';

(async function () {
  "use strict";

  const pinButtonStyles = new Style(`
      #pinVideoButton {
        position: absolute;
        top: 0;
        z-index: 2;
        right: 0;
        opacity: 0;
        transition: opacity 400ms;
        background-color: rgba(0, 0, 0, 0.33);
        backdrop-filter: blur(4px);
        color: white;
        font-weight: 700;
        border: none;
        border-radius: 4px var(--cds-border-radius-200) 4px 100%;
        padding: 0px 4px 4px 8px;

        span {
          display: inline-block;
          transform: rotateZ(30deg);
        }

        @media screen and (max-width: 1024px) {
          position: fixed;
          top: 82px;
          right: 25px;
        }

        @media screen and (max-width: 599px) {
          right: 16px;
        }
      }

      ${outerContainer}:has(${innerContainer}):has(${player}):hover {
        #pinVideoButton {
          opacity: 1;
        }
      }
    `);

  document.head.append(pinButtonStyles);

  const pinButton = document.createElement("button");
  pinButton.innerHTML = "<span>pin</span>";
  pinButton.id = "pinVideoButton";

  const container = await waitForElement(
    `${innerContainer}:has(${player})`
  ).catch((msg) => {
    throw new Error(`Video container not found:\n\t${msg}`);
  });

  container.append(pinButton);

  const pinnedVideoStyles = new Style(`
        ${outerContainer}:has(${innerContainer}):has(${player}) {
            z-index: 4;
            position: sticky;
            top: 0;

            ${innerContainer} {
                height: 400px!important;
            }
        }
    `);

  pinButton.addEventListener("click", () => {
    if (document.head.contains(pinnedVideoStyles)) {
      pinnedVideoStyles.remove();
    } else {
      document.head.append(pinnedVideoStyles);
    }
  });
})();

async function waitForElement(
  selector,
  { container = document.body, waitFor = 30000 } = {}
) {
  return new Promise((res, rej) => {
    const timeout = setTimeout(() => {
      clearInterval(interval);
      return rej("timeout");
    }, waitFor);

    const interval = setInterval(() => {
      const element = container.querySelector(selector);
      if (element) {
        clearTimeout(timeout);
        clearInterval(interval);
        return res(element);
      }
    }, 1000);
  });
}

function Style(content) {
  const st = document.createElement("style");
  st.textContent = content;
  return st;
}
