# bookmark-first

![CI](https://github.com/fnobi/bookmark-first/actions/workflows/ci.yml/badge.svg)

ブックマークをインクリメンタルサーチできるChrome拡張機能。

Node.jsのバージョンは`.node-version`を参照してください。パッケージマネージャーは[pnpm](https://pnpm.io/)を使用します。

## 開発

```sh
pnpm install
pnpm run build      # popup/js/ にJSを出力
pnpm run watch      # ファイル変更を監視してビルド
pnpm run typecheck
pnpm run lint       # ESLint + Prettierのチェック
pnpm run format     # Prettierで自動整形
pnpm run test       # Vitestでユニットテストを実行
```

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
4. Chrome Web Store Publish APIへのアップロード・公開(`scripts/publish-chrome-webstore.sh`)
5. `dist/extension.zip` を添付したGitHub Releaseの作成

### 手順

1. `manifest.json` / `package.json` の `version` を更新してmasterにマージする
2. `git tag v0.5.0 && git push origin v0.5.0` のようにタグをpushする

### 事前に必要なGitHub Secrets

Chrome Web Store側のAPIを使うため、以下をリポジトリのSecretsに設定してください(初回のみ手動セットアップが必要です)。

- `CHROME_EXTENSION_ID`: Chrome Web Store Developer Dashboard上の拡張機能ID
- `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET`: Google Cloudで発行したOAuthクライアントの認証情報
- `CHROME_REFRESH_TOKEN`: 上記クライアントで取得したrefresh token(`https://www.googleapis.com/auth/chromewebstore` スコープ)

APIでの公開リクエスト自体は成功しても、実際の公開までにChromeストア側の審査が挟まる場合があります。

Google Cloud側の必要なAPI有効化は [`terraform/`](./terraform) で管理しています。OAuthクライアントの作成とrefresh tokenの取得は現状Terraformでは自動化できず手動作業が必要なため、詳しい手順は [`terraform/README.md`](./terraform/README.md) を参照してください。
