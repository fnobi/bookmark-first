interface BookmarkOptions {
    title?: string;
    url?: string;
    children?: BookmarkOptions[];
}

function getFaviconUrl(url: string): string | null {
    if (typeof chrome === 'undefined' || !chrome.runtime?.getURL) {
        return null;
    }

    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', url);
    faviconUrl.searchParams.set('size', '16');
    return faviconUrl.toString();
}

export class Bookmark {
    title?: string;
    url?: string;
    children?: Bookmark[];
    itemDom!: HTMLLIElement;

    constructor(opts: BookmarkOptions = {}) {
        this.title = opts.title;
        this.url = opts.url;

        this.loadChildren(opts.children);
        this.initDom();
    }

    loadChildren(childrenOpts?: BookmarkOptions[]) {
        if (!childrenOpts) {
            return;
        }

        const children: Bookmark[] = [];
        childrenOpts.forEach((opts) => {
            children.push(new Bookmark(opts));
        });
        this.children = children;
    }

    initDom() {
        const itemDom = document.createElement('li');
        itemDom.setAttribute('data-match', String(false));

        if (this.children) {
            if (this.title) {
                const titleDom = document.createElement('strong');
                titleDom.textContent = this.title;
                itemDom.appendChild(titleDom);
            }

            const listDom = document.createElement('ul');
            const fragment = document.createDocumentFragment();
            this.children.forEach((bookmark) => {
                fragment.append(bookmark.itemDom);
            });

            listDom.appendChild(fragment);
            itemDom.appendChild(listDom);
        } else {
            const anchorDom = document.createElement('a');
            anchorDom.href = this.url!;

            const faviconUrl = getFaviconUrl(this.url!);
            if (faviconUrl) {
                const faviconDom = document.createElement('img');
                faviconDom.className = 'favicon';
                faviconDom.src = faviconUrl;
                faviconDom.alt = '';
                anchorDom.appendChild(faviconDom);
            }

            const titleDom = document.createElement('span');
            titleDom.textContent = this.title!;
            anchorDom.appendChild(titleDom);

            const urlFooterDom = document.createElement('footer');
            urlFooterDom.textContent = this.url!;
            anchorDom.appendChild(urlFooterDom);
            itemDom.appendChild(anchorDom);
        }
        this.itemDom = itemDom;
    }

    match(keywordList: string[], parentMatch = false): boolean {
        let selfMatch = !!keywordList.length;
        keywordList.forEach((keyword) => {
            selfMatch =
                selfMatch &&
                !!keyword &&
                (this.titleMatch(keyword) || this.urlMatch(keyword));
        });

        let childrenMatch = false;
        if (this.children) {
            this.children.forEach((bookmark) => {
                const childMatch = bookmark.match(
                    keywordList,
                    parentMatch || selfMatch,
                );
                childrenMatch = childrenMatch || childMatch;
            });
        }

        const allMatch = parentMatch || selfMatch || childrenMatch;
        this.itemDom.setAttribute('data-match', String(allMatch));

        return allMatch;
    }

    titleMatch(keyword: string): boolean {
        return !!this.title && new RegExp(keyword, 'i').test(this.title);
    }

    urlMatch(keyword: string): boolean {
        return !!this.url && this.url.indexOf(keyword) >= 0;
    }
}
