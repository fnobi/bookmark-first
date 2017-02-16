class Bookmark {
    constructor (opts = {}) {
        this.title = opts.title;
        this.url = opts.url;
        
        this.loadChildren(opts.children);
        this.initDom();
    }

    loadChildren (childrenOpts) {
        if (!childrenOpts) {
            return;
        }

        const children = [];
        childrenOpts.forEach((opts) => {
            children.push(new Bookmark(opts));
        });
        this.children = children;
    }

    initDom () {
        const itemDom = document.createElement('li');
        itemDom.setAttribute('data-match', false);
        
        if (this.children) {
            if (this.title) {
                const titleDom = document.createElement('strong');
                titleDom.innerHTML = this.title;
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
            anchorDom.innerHTML = this.title;
            anchorDom.href = this.url;
            const urlFooterDom = document.createElement('footer');
            urlFooterDom.innerHTML = this.url;
            anchorDom.appendChild(urlFooterDom);
            itemDom.appendChild(anchorDom);
        }
        this.itemDom = itemDom;
    }

    match (keywordList, parentMatch = false) {
        let selfMatch = !!keywordList.length;
        keywordList.forEach((keyword) => {
            selfMatch = selfMatch && keyword && (
                this.titleMatch(keyword) || this.urlMatch(keyword)
            );
        });
        
        let childrenMatch = false;
        if (this.children) {
            this.children.forEach((bookmark) => {
                const childMatch = bookmark.match(
                    keywordList,
                    parentMatch || selfMatch
                );
                childrenMatch = childrenMatch || childMatch;
            });
        }

        const allMatch = parentMatch || selfMatch || childrenMatch;
        this.itemDom.setAttribute('data-match', allMatch);
        
        return allMatch;
    }

    titleMatch (keyword) {
        return this.title && (new RegExp(keyword, 'i').test(this.title));
    }

    urlMatch (keyword) {
        return this.url && this.url.indexOf(keyword) >= 0;
    }
}










