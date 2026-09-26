# bookmark-first

![CI](https://github.com/fnobi/bookmark-first/actions/workflows/ci.yml/badge.svg)

ブックマークをインクリメンタルサーチできるChrome拡張機能。

Node.jsのバージョンは`.node-version`を参照してください。パッケージマネージャーは[pnpm](https://pnpm.io/)を使用します。

## 開発

```sh
pnpm install
pnpm run build      # popup/js/ にJSを出力
pnpm run watch      # ファイル変更を監視してビルド
pnpm run dev        # ポップアップの見た目をブラウザ上でホットリロード確認(下記参照)
pnpm run typecheck
pnpm run lint       # ESLint + Prettierのチェック
pnpm run format     # Prettierで自動整形
pnpm run test       # Vitestでユニットテストを実行
```

## ポップアップの見た目を素早く確認する(`pnpm run dev`)

`chrome.bookmarks` APIはブラウザ拡張機能としてしか実行できないため、`dev/`配下にViteのdevサーバー用エントリを用意し、`chrome.bookmarks.getTree` などをダミーデータでモックしています。

```sh
pnpm run dev
```

を実行すると、`dev/index.html` がブラウザで開き、`src/popup/`配下のTS/CSSを編集するとホットリロードされます。画面上部のリンクからブックマークのダミーデータ(空の状態・長いタイトル・大量アイテムなど)を切り替えられます(`?fixture=`クエリパラメータでも指定可能)。

この仕組みは開発用で、`pnpm run package`(拡張機能のzip化)には含まれません。

## 拡張機能の読み込み方

1. `pnpm run build` を実行し `popup/js/` にビルド成果物を生成する
2. Chromeの `chrome://extensions` を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」からこのリポジトリのルートディレクトリを選択する

## リリース(Chrome Web Storeへの公開)

`v*` 形式のタグをpushすると `.github/workflows/release.yml` が起動し、以下を自動実行します。

1. `typecheck` / `lint` / `test` の実行
2. `manifest.json` の `version` とタグ名(`vX.Y.Z` の `X.Y.Z` 部分)が一致するかの検証(不一致ならリリース中断)
3. 拡張機能のzip化(`pnpm run package` → `dist/extension.zip`)
4. `dist/extension.zip` を添付したGitHub Releaseの作成

Chrome Web Storeへのアップロード・公開はCIには含めておらず、[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) からGitHub Releaseの`extension.zip`を手動でアップロードする。

(Chrome Web Store Publish APIを使ったアップロードの自動化も検討したが、OAuthクライアントを本番公開ステータスにしない限りrefresh tokenが7日で失効し、静かに壊れるリスクがあったため見送っている)

### 手順

1. `manifest.json` / `package.json` の `version` を更新してmasterにマージする
2. `git tag v0.5.0 && git push origin v0.5.0` のようにタグをpushする
3. GitHub Releaseにアップロードされた `extension.zip` をダウンロードし、Chrome Web Store Developer Dashboardから公開する
