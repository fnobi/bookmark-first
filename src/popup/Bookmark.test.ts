import { describe, it, expect, afterEach } from 'vitest';
import { Bookmark } from './Bookmark';

describe('Bookmark#match (leaf node)', () => {
    it('matches when the keyword is contained in the title (case-insensitive)', () => {
        const bookmark = new Bookmark({
            title: 'Example Site',
            url: 'https://example.com',
        });
        expect(bookmark.match(['example'])).toBe(true);
        expect(bookmark.itemDom.getAttribute('data-match')).toBe('true');
    });

    it('matches when the keyword is contained in the url', () => {
        const bookmark = new Bookmark({
            title: 'foo',
            url: 'https://example.com/bar',
        });
        expect(bookmark.match(['example.com'])).toBe(true);
    });

    it('does not match when the keyword is not found in the title or url', () => {
        const bookmark = new Bookmark({
            title: 'foo',
            url: 'https://example.com',
        });
        expect(bookmark.match(['zzz'])).toBe(false);
        expect(bookmark.itemDom.getAttribute('data-match')).toBe('false');
    });

    it('requires every keyword to match (AND)', () => {
        const bookmark = new Bookmark({
            title: 'Example Site',
            url: 'https://example.com',
        });
        expect(bookmark.match(['example', 'site'])).toBe(true);
        expect(bookmark.match(['example', 'zzz'])).toBe(false);
    });

    it('does not match when the keyword list is empty', () => {
        const bookmark = new Bookmark({
            title: 'foo',
            url: 'https://example.com',
        });
        expect(bookmark.match([])).toBe(false);
    });
});

describe('Bookmark#initDom', () => {
    it('renders a title containing HTML-like text as plain text, not markup', () => {
        const bookmark = new Bookmark({
            title: '<img src=x onerror=alert(1)>',
            url: 'https://example.com',
        });
        const anchor = bookmark.itemDom.querySelector('a');
        expect(anchor?.firstChild?.textContent).toBe(
            '<img src=x onerror=alert(1)>',
        );
        expect(anchor?.querySelector('img')).toBeNull();
    });
});

describe('Bookmark#initDom (favicon)', () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, 'chrome');
    });

    it('does not add a favicon img when chrome APIs are unavailable', () => {
        const bookmark = new Bookmark({
            title: 'Example Site',
            url: 'https://example.com',
        });
        expect(bookmark.itemDom.querySelector('img.favicon')).toBeNull();
    });

    it('adds a favicon img built from chrome.runtime.getURL when available', () => {
        Object.assign(globalThis, {
            chrome: {
                runtime: {
                    getURL: (path: string) =>
                        `chrome-extension://abc123${path}`,
                },
            },
        });

        const bookmark = new Bookmark({
            title: 'Example Site',
            url: 'https://example.com/page',
        });
        const favicon =
            bookmark.itemDom.querySelector<HTMLImageElement>('img.favicon');
        expect(favicon?.src).toBe(
            'chrome-extension://abc123/_favicon/?pageUrl=https%3A%2F%2Fexample.com%2Fpage&size=16',
        );
    });
});

describe('Bookmark#match (folder node)', () => {
    it('matches a folder whose child matches, even if the folder itself does not', () => {
        const bookmark = new Bookmark({
            title: 'My Folder',
            children: [{ title: 'foo', url: 'https://example.com' }],
        });
        expect(bookmark.match(['example'])).toBe(true);
        expect(bookmark.itemDom.getAttribute('data-match')).toBe('true');
    });

    it('does not match when no child matches and the folder title does not match either', () => {
        const bookmark = new Bookmark({
            title: 'My Folder',
            children: [{ title: 'foo', url: 'https://example.com' }],
        });
        expect(bookmark.match(['zzz'])).toBe(false);
    });

    it('forces every descendant to match once an ancestor matches', () => {
        const bookmark = new Bookmark({
            title: 'example folder',
            children: [{ title: 'unrelated', url: 'https://unrelated.test' }],
        });
        expect(bookmark.match(['example'])).toBe(true);
        expect(bookmark.children?.[0].itemDom.getAttribute('data-match')).toBe(
            'true',
        );
    });
});
