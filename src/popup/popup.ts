const KEYCODE_ENTER = 13;
const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;

const incrementDom = document.querySelector<HTMLInputElement>('.js-increment')!;
const bookmarkRootDom = document.querySelector<HTMLUListElement>('.js-bookmark-root')!;

let rootBookmark: Bookmark | null = null;
let activeIndex = 0;
let isCursorKey = false;

function init () {
    initIncrementEvent();
    initAnchorClickEvent();
    loadBookmark();
    incrementDom.focus();
}

function initIncrementEvent () {
    incrementDom.addEventListener('keyup', () => {
        if (isCursorKey) {
            isCursorKey = false;
            return;
        }

        const keywordList = incrementDom.value
                  ? trim(incrementDom.value).split(/ +/g)
                  : [];
        const globalMatch = rootBookmark!.match(keywordList);
        bookmarkRootDom.setAttribute('data-empty', String(!globalMatch));
        setActive(0);
    });

    document.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
        case KEYCODE_ENTER: {
            const activeAnchor = document.querySelector<HTMLAnchorElement>('a[data-active="true"]');
            if (activeAnchor && activeAnchor.href) {
                window.open(activeAnchor.href);
            }
            break;
        }
        case KEYCODE_UP:
            setActive(activeIndex - 1);
            isCursorKey = true;
            break;
        case KEYCODE_DOWN:
            setActive(activeIndex + 1);
            isCursorKey = true;
            break;
        }
    });

    incrementDom.addEventListener('blur', () => {
        clearActive();
    });

    incrementDom.addEventListener('focus', () => {
        setActive(0);
    });
}

function initAnchorClickEvent () {
    bookmarkRootDom.addEventListener('click', (e) => {
        const el = e.target as HTMLElement;
        if (/^a$/i.test(el.tagName) && (el as HTMLAnchorElement).href) {
            window.open((el as HTMLAnchorElement).href);
        }
    });
}

function loadBookmark () {
    bookmarkRootDom.innerHTML = '';

    chrome.bookmarks.getTree((results) => {
        rootBookmark = new Bookmark({
            children: results
        });

        bookmarkRootDom.appendChild(rootBookmark.itemDom);
    });
}

function clearActive () {
    document.querySelectorAll<HTMLAnchorElement>('a[data-active="true"]').forEach((el) => {
        el.setAttribute('data-active', String(false));
    });
}

function setActive (index: number) {
    clearActive();
    const matching = document.querySelectorAll<HTMLAnchorElement>('li[data-match="true"] > a');
    if (!matching.length) {
        return;
    }

    index = Math.max(index, 0);
    index = Math.min(index, matching.length - 1);
    matching[index].setAttribute('data-active', String(true));
    activeIndex = index;
}

function trim (string = ''): string {
    return string.replace(/^ +/, '').replace(/ +$/, '');
}

init();
