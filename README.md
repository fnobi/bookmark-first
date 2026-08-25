# bookmark-first

ブックマークをインクリメンタルサーチできるChrome拡張機能。

## 開発

```sh
npm install
npm run build   # popup/js/ にJSを出力
npm run watch   # ファイル変更を監視してビルド
npm run typecheck
```

## 拡張機能の読み込み方

1. `npm run build` を実行し `popup/js/` にビルド成果物を生成する
2. Chromeの `chrome://extensions` を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」からこのリポジトリのルートディレクトリを選択する
