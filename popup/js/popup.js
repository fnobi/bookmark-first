const incrementDom = document.querySelector('.js-increment');
const bookmarkRootDom = document.querySelector('.js-bookmark-root');

let rootBookmark = null;

function init () {
    initKeyEvent();
    initAnchorClickEvent();
    loadBookmark();
}

function initKeyEvent () {
    incrementDom.addEventListener('keyup', () => {
        rootBookmark.match(incrementDom.value);
    });
}

function initAnchorClickEvent () {
    bookmarkRootDom.addEventListener('click', (e) => {
        const el = e.target;
        if (/^a$/i.test(el.tagName) && el.href) {
            window.open(el.href);
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

init();
