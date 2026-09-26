let nextId = 1;

function id(): string {
    return String(nextId++);
}

function folder(
    title: string,
    children: chrome.bookmarks.BookmarkTreeNode[],
): chrome.bookmarks.BookmarkTreeNode {
    return { id: id(), title, children };
}

function bookmark(
    title: string,
    url: string,
): chrome.bookmarks.BookmarkTreeNode {
    return { id: id(), title, url };
}

function root(
    children: chrome.bookmarks.BookmarkTreeNode[],
): chrome.bookmarks.BookmarkTreeNode[] {
    return [{ id: '0', title: '', children }];
}

const defaultFixture = root([
    folder('ブックマーク バー', [
        bookmark('Claude', 'https://claude.ai/'),
        bookmark('GitHub', 'https://github.com/'),
        folder('仕事', [
            bookmark('社内Wiki', 'https://wiki.example.com/'),
            bookmark('チケット管理', 'https://tracker.example.com/'),
            folder('プロジェクトA', [
                bookmark('仕様書', 'https://docs.example.com/project-a/spec'),
                bookmark(
                    'デザインカンプ',
                    'https://design.example.com/project-a',
                ),
            ]),
        ]),
        folder('読み物', [
            bookmark('MDN Web Docs', 'https://developer.mozilla.org/'),
            bookmark('Zenn', 'https://zenn.dev/'),
        ]),
    ]),
    folder('その他のブックマーク', [
        bookmark('Amazon', 'https://www.amazon.co.jp/'),
        bookmark('YouTube', 'https://www.youtube.com/'),
    ]),
]);

const emptyFixture = root([
    folder('ブックマーク バー', []),
    folder('その他のブックマーク', []),
]);

const longTitlesFixture = root([
    folder('ブックマーク バー', [
        bookmark(
            'とても長いタイトルのブックマークで折り返しや省略表示の崩れを確認するためのテストケースその1',
            'https://example.com/very/long/path/that/keeps/going/for/a/while/to/test/the-footer-ellipsis',
        ),
        bookmark(
            'Another Extremely Long Bookmark Title Used To Check Overflow Handling In The Popup List Item',
            'https://example.com/another-long-one',
        ),
        folder('長い名前のフォルダでラベル表示を確認するためのテストケース', [
            bookmark('短いタイトル', 'https://example.com/short'),
        ]),
    ]),
]);

const manyItemsFixture = root([
    folder(
        'ブックマーク バー',
        Array.from({ length: 60 }, (_, i) =>
            bookmark(
                `サンプルブックマーク ${i + 1}`,
                `https://example.com/item-${i + 1}`,
            ),
        ),
    ),
]);

export const fixtures = {
    default: defaultFixture,
    empty: emptyFixture,
    'long-titles': longTitlesFixture,
    'many-items': manyItemsFixture,
} satisfies Record<string, chrome.bookmarks.BookmarkTreeNode[]>;

export type FixtureName = keyof typeof fixtures;
