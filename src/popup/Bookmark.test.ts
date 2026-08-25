import { describe, it, expect } from 'vitest';
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
