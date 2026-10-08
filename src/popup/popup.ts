import { Bookmark } from './Bookmark.js';

function queryRequired<T extends Element>(selector: string): T {
    const el = document.querySelector<T>(selector);
    if (!el) {
        throw new Error(`element not found: ${selector}`);
    }
    return el;
}

const incrementDom = queryRequired<HTMLInputElement>('.js-increment');
const incrementFormDom = queryRequired<HTMLFormElement>(
    '.js-increment-form',
);
const bookmarkRootDom = queryRequired<HTMLUListElement>('.js-bookmark-root');

let rootBookmark: Bookmark | null = null;
let activeIndex = 0;
let isCursorKey = false;

function init() {
    initIncrementEvent();
    initAnchorClickEvent();
    loadBookmark();
    incrementDom.focus();
}

function initIncrementEvent() {
    incrementDom.addEventListener('keyup', () => {
        if (isCursorKey) {
            isCursorKey = false;
            return;
        }

        if (!rootBookmark) {
            return;
        }

        const keywordList = incrementDom.value
            ? trim(incrementDom.value).split(/ +/g)
            : [];
        const globalMatch = rootBookmark.match(keywordList);
        bookmarkRootDom.setAttribute('data-empty', String(!globalMatch));
        setActive(0);
    });

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setActive(activeIndex - 1);
                isCursorKey = true;
                break;
            case 'ArrowDown':
                e.preventDefault();
                setActive(activeIndex + 1);
                isCursorKey = true;
                break;
        }
    });

    incrementFormDom.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeAnchor = document.querySelector<HTMLAnchorElement>(
            'a[data-active="true"]',
        );
        if (activeAnchor && activeAnchor.href) {
            window.open(activeAnchor.href);
        }
    });

    incrementDom.addEventListener('blur', () => {
        clearActive();
    });

    incrementDom.addEventListener('focus', () => {
        setActive(0);
    });
}

function initAnchorClickEvent() {
    bookmarkRootDom.addEventListener('click', (e) => {
        const el = e.target as HTMLElement;
        if (/^a$/i.test(el.tagName) && (el as HTMLAnchorElement).href) {
            window.open((el as HTMLAnchorElement).href);
        }
    });
}

function loadBookmark() {
    bookmarkRootDom.replaceChildren();

    chrome.bookmarks.getTree((results) => {
        rootBookmark = new Bookmark({
            children: results,
        });

        bookmarkRootDom.appendChild(rootBookmark.itemDom);
    });
}

function clearActive() {
    document
        .querySelectorAll<HTMLAnchorElement>('a[data-active="true"]')
        .forEach((el) => {
            el.setAttribute('data-active', String(false));
        });
}

function setActive(index: number) {
    clearActive();
    const matching = document.querySelectorAll<HTMLAnchorElement>(
        'li[data-match="true"] > a',
    );
    if (!matching.length) {
        return;
    }

    index = Math.max(index, 0);
    index = Math.min(index, matching.length - 1);
    matching[index].setAttribute('data-active', String(true));
    activeIndex = index;
    centerActive(matching[index]);
}

function centerActive(anchor: HTMLAnchorElement) {
    if (!rootBookmark) {
        return;
    }

    const contentDom = rootBookmark.itemDom;
    const containerHeight = bookmarkRootDom.clientHeight;
    const offset = Math.max(
        anchor.offsetTop + anchor.offsetHeight / 2 - containerHeight / 2,
        0,
    );

    contentDom.style.transform = `translateY(${-offset}px)`;
}

function trim(string = ''): string {
    return string.replace(/^ +/, '').replace(/ +$/, '');
}

init();
