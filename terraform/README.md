# terraform

`.github/workflows/release.yml` からChrome Web Store Publish APIを呼び出すために必要な、Google Cloud側のセットアップをTerraformで管理する。

## このTerraformが自動化するもの / しないもの

**自動化するもの**

- 必要なAPI(`chromewebstore.googleapis.com` / `iap.googleapis.com`)の有効化
- OAuth同意画面(ブランド)の作成
- OAuth 2.0クライアントID/シークレットの発行

**自動化できないもの(手動が必須)**

- **refresh tokenの取得**: OAuthの認可コードフローは人間がブラウザでGoogleアカウントにログインして同意する操作が必要なため、原理的にTerraformだけでは完結しない。下記の手順を参照。
- **Chrome拡張のextension ID**: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) で最初の1回だけ手動でアップロードして登録する必要がある(未登録のアイテムにAPI経由で新規アップロードすることはできない)。2回目以降はCIから`scripts/publish-chrome-webstore.sh`で更新できる。

## 使い方

前提として、公開に使うGoogle Cloudプロジェクトをあらかじめ作成し、Terraformを実行するアカウントにそのプロジェクトへの十分な権限(Owner、または `roles/serviceusage.serviceUsageAdmin` + IAP関連の権限)を付与しておくこと。

```sh
cd terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して project_id / support_email を設定する

terraform init
terraform plan
terraform apply
```

`apply`が終わると以下が出力される。

- `oauth_client_id`
- `oauth_client_secret`(sensitive。`terraform output -raw oauth_client_secret` で表示)

これらをリポジトリのGitHub Secretsに `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET` として設定する。

## refresh tokenの取得手順(手動・初回のみ)

1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) を開く
2. 右上の歯車アイコン(Settings)から「Use your own OAuth credentials」にチェックを入れ、上記の `oauth_client_id` / `oauth_client_secret` を入力する
3. 左側のInput your own scopesに `https://www.googleapis.com/auth/chromewebstore` を入力し、「Authorize APIs」をクリック
4. Chrome Web Storeの対象拡張機能を所有しているGoogleアカウントでログイン・同意する
5. 「Exchange authorization code for tokens」をクリックし、表示された **Refresh token** の値を控える
6. その値をGitHub Secretsに `CHROME_REFRESH_TOKEN` として設定する

もしOAuth Playgroundでの認可がうまくいかない場合(リダイレクトURIの制約などでエラーになる場合)は、代わりにGoogle CloudコンソールのAPIとサービス→認証情報から手動で「OAuth クライアント ID」(アプリケーションの種類: デスクトップアプリ)を作成し、そのclient_id/client_secretを使う方法に切り替えてもよい。その場合、Terraformで作成した `google_iap_client` はGitHub Secretsには使わず未使用のままにするか、`terraform destroy` で削除して構わない。

## Stateの管理

このディレクトリはデフォルトでローカルstate(`terraform.tfstate`、gitignore対象)を使う想定。チームで共有する場合はGCSなどのリモートバックエンドに切り替えること。
