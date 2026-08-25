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
