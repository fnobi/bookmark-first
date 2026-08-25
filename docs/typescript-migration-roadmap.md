# TypeScript化ロードマップ

## 前提・現状整理

- ビルドツール・パッケージ管理なし(`package.json`が存在しない)
- `popup/index.html` から `popup/js/Bookmark.js` と `popup/js/popup.js` を素の `<script>` タグで読み込んでいる(ES Modules未使用、`class Bookmark` やイベントハンドラ用の関数はすべてグローバルスコープ)
- `chrome.bookmarks` API に依存(Manifest V3)
- lint・formatter・テストは未整備
- コード量は合計150行程度と小規模

この規模であれば、大掛かりな移行計画は不要で、**6段階・6PR程度**に分けて進めれば数日〜1週間程度で完了できる見込みです。各フェーズは独立してレビュー・マージ可能な粒度にしています。

---

## Phase 0: 開発基盤の構築(PR #1)

TypeScript導入の前に、最低限のビルド・パッケージ管理を用意する。

- `package.json` を新規作成(npm想定)
- devDependencies: `typescript`, `@types/chrome`
- `tsconfig.json` を作成
  - `target: ES2020`, `module: ES2020" or "None"`(下記Phase 3まではモジュール化しないため一旦 `module: none` でも可)
  - `outDir` はビルド後のJSファイルの出力先とする
- ディレクトリ構成の変更
  - ソースを `src/popup/Bookmark.ts`, `src/popup/popup.ts` に移動
  - ビルド成果物は現状通り `popup/js/Bookmark.js`, `popup/js/popup.js` に出力し、`popup/index.html` / `manifest.json` の参照先は変更しない
  - `popup/js/*.js` をビルド成果物として `.gitignore` に追加(コミットしない方針にする)
- npm scripts: `build`(`tsc`)、`watch`(`tsc -w`)、`typecheck`(`tsc --noEmit`)
- README に開発手順(`npm install` → `npm run build` → 「パッケージ化されていない拡張機能を読み込む」)を追記

## Phase 1: 型を付けただけの素直な変換(PR #2)

ロジックは変更せず、拡張子変更 + 型注釈追加のみ行う。

- `Bookmark.js` → `Bookmark.ts`
  - コンストラクタの `opts` に型(`chrome.bookmarks.BookmarkTreeNode` を参考にした独自interface、または直接 `chrome.bookmarks.BookmarkTreeNode` を使用)を付与
  - フィールド `title?: string`, `url?: string`, `children?: Bookmark[]`, `itemDom!: HTMLLIElement` を明示
  - `match()` の引数 `keywordList: string[]`, `parentMatch: boolean`
- `popup.js` → `popup.ts`
  - `document.querySelector` の戻り値に対する型ガード/アサーションを追加(`as HTMLInputElement` など)
  - `KeyboardEvent` の型を明示
- この時点では `strict` は無効のままでOK(まず動くことを優先)

## Phase 2: strictモード対応・null安全化(PR #3)

- `tsconfig.json` の `strict: true` を有効化
- 発生するエラー(`noImplicitAny`, `strictNullChecks` 由来)を解消
  - 例: `bookmarkRootDom`, `incrementDom` の `querySelector` がnullを返す可能性への対応
  - `rootBookmark` の初期値 `null` に対する非nullアサーション/ガードの整理
  - `Bookmark.itemDom` が `initDom()` 呼び出し前は未定義である点の型設計見直し(コンストラクタ内で必ず呼ばれるため `!` アサーションか、フィールド初期化順の整理)

## Phase 3: ESモジュール化 + Lint/Format導入(PR #4)

- `Bookmark.ts` を `export class Bookmark` に、`popup.ts` で `import` する形に変更
- `popup/index.html` の `<script>` タグを `type="module"` にし、`Bookmark.js` の読み込みタグは削除(popup.js側でimportするため)
- ESLint(`typescript-eslint`)+ Prettier を導入し、`npm run lint` を追加

## Phase 4: テスト導入(PR #5)

- テストランナー導入(Vitest推奨、設定が軽量なため)
- `Bookmark.match()` のキーワードマッチングロジックに対する単体テストを追加
  - DOM操作(`initDom`)とマッチングロジック(`match`)が現状密結合なので、テスト容易性のために分離を検討(例: DOM構築を`render()`に切り出し、コンストラクタから独立させる)
- `chrome.bookmarks` 等ブラウザAPIのモックが必要な箇所は最小限のスタブで対応

## Phase 5: CI構築(PR #6)

- GitHub Actions workflow(`.github/workflows/ci.yml`)を追加
  - `npm ci` → `npm run typecheck` → `npm run lint` → `npm test` → `npm run build`
- PR作成時に自動実行されるようにする

---

## 任意のフォローアップ(TS移行そのものとは別スコープ)

移行中に気づいた改善点。TS化の妨げにはならないため、必要に応じて別Issueで対応:

- `popup.js` の `KEYCODE_ENTER` 等は非推奨の `KeyboardEvent.keyCode` を使用している → `event.key` ベースに置き換え
- `Bookmark.ts` で `innerHTML = this.title` を使っている箇所(`initDom`)は、タイトルにHTML特殊文字が含まれるブックマークがあると意図しないマークアップになりうるため `textContent` への置き換えを検討
- `manifest.json` のバージョンを移行完了時にbump

---

## まとめ

| Phase | 内容 | 目安PR |
|---|---|---|
| 0 | 開発基盤構築(package.json, tsconfig, ディレクトリ構成) | PR #1 |
| 1 | 型注釈のみの素直な変換 | PR #2 |
| 2 | strict化・null安全対応 | PR #3 |
| 3 | ESM化・Lint/Format導入 | PR #4 |
| 4 | テスト導入 | PR #5 |
| 5 | CI構築 | PR #6 |

バンドラ(esbuild/Viteなど)は現状ファイル数が2つのみでimport/exportもESM化(Phase 3)で十分まかなえるため、当面は `tsc` 単体での運用を推奨。将来的にファイル数やnpm依存が増えてきたタイミングで再検討する。
