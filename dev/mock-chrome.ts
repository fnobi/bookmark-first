import { fixtures, type FixtureName } from './fixtures.js';

function resolveFixtureName(): FixtureName {
    const requested = new URLSearchParams(location.search).get('fixture');
    return requested && requested in fixtures
        ? (requested as FixtureName)
        : 'default';
}

const fixtureName = resolveFixtureName();

const mockChrome = {
    bookmarks: {
        getTree(
            callback: (results: chrome.bookmarks.BookmarkTreeNode[]) => void,
        ) {
            callback(fixtures[fixtureName]);
        },
    },
    runtime: {
        getURL() {
            return new URL(
                '/favicon-placeholder.svg',
                location.origin,
            ).toString();
        },
    },
};

(globalThis as unknown as { chrome: typeof chrome }).chrome =
    mockChrome as unknown as typeof chrome;

console.info(
    `[dev] fixture: "${fixtureName}" (?fixture=${Object.keys(fixtures).join('|')} で切り替え)`,
);
