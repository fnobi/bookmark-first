# terraform

`.github/workflows/release.yml` からChrome Web Store Publish APIを呼び出すために必要な、Google Cloud側のセットアップをTerraformで管理する。

> **Note**: 以前は `google_iap_brand` / `google_iap_client` を使っていましたが、IAP OAuth Admin APIの廃止(2026-01-19に機能停止、2026-03-19にAPI自体を完全停止)により使用できなくなったため、後継の `google_iam_oauth_client` / `google_iam_oauth_client_credential`(IAM OAuth Client API)ベースの構成に変更しています。

## このTerraformが自動化するもの / しないもの

**自動化するもの**

- 必要なAPI(`chromewebstore.googleapis.com` / `iam.googleapis.com`)の有効化
- OAuth 2.0クライアント(`google_iam_oauth_client`)とそのクライアントシークレット(`google_iam_oauth_client_credential`)の発行

**自動化できないもの(手動が必須)**

- **OAuth同意画面の設定**: Google Cloudコンソールの「APIとサービス」→「OAuth同意画面」で、アプリ名・サポートメールアドレスの設定と、スコープ `https://www.googleapis.com/auth/chromewebstore` の追加、テストユーザーとして自分のGoogleアカウントを登録しておく必要がある(この部分に対応するTerraformリソースは現時点で確認できていない)
- **refresh tokenの取得**: OAuthの認可コードフローは人間がブラウザでGoogleアカウントにログインして同意する操作が必要なため、原理的にTerraformだけでは完結しない。下記の手順を参照
- **Chrome拡張のextension ID**: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) で最初の1回だけ手動でアップロードして登録する必要がある(未登録のアイテムにAPI経由で新規アップロードすることはできない)。2回目以降はCIから`scripts/publish-chrome-webstore.sh`で更新できる

## 使い方

前提として、公開に使うGoogle Cloudプロジェクトをあらかじめ作成し、Terraformを実行するアカウントにそのプロジェクトへの十分な権限(Owner、または `roles/serviceusage.serviceUsageAdmin` + IAM関連の権限)を付与しておくこと。

```sh
cd terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して project_id を設定する

terraform init
terraform plan
terraform apply
```

`apply`が終わると以下が出力される。

- `oauth_client_id` / `oauth_client_resource_id`(どちらがOAuth Playgroundの「Client ID」欄に入れるべき値かは、GCPコンソールの「APIとサービス」→「認証情報」に表示されるクライアントIDと突き合わせて確認すること)
- `oauth_client_secret`(sensitive。`terraform output -raw oauth_client_secret` で表示)

確認できたら、リポジトリのGitHub Secretsに `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET` として設定する。

## refresh tokenの取得手順(手動・初回のみ)

1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) を開く
2. 右上の歯車アイコン(Settings)から「Use your own OAuth credentials」にチェックを入れ、上記の Client ID / Client secret を入力する
3. 左側のInput your own scopesに `https://www.googleapis.com/auth/chromewebstore` を入力し、「Authorize APIs」をクリック
4. Chrome Web Storeの対象拡張機能を所有しているGoogleアカウントでログイン・同意する
5. 「Exchange authorization code for tokens」をクリックし、表示された **Refresh token** の値を控える
6. その値をGitHub Secretsに `CHROME_REFRESH_TOKEN` として設定する

`google_iam_oauth_client` の `allowed_redirect_uris` には、OAuth Playgroundが要求するリダイレクトURI(`https://developers.google.com/oauthplayground`)をあらかじめ登録済み。

## この構成で未検証な点について

この環境ではネットワークポリシーの制約で `registry.terraform.io` にアクセスできず、`terraform init` やproviderスキーマに基づく `terraform validate` を実行できていない(`terraform fmt` によるHCL構文チェックのみ実施済み)。特に以下は実際に `terraform apply` を通してみないと確定できないため、エラーが出た場合は内容を教えてほしい。

- `google_iam_oauth_client` / `google_iam_oauth_client_credential` の引数名・出力属性名(`oauth_client_id` / `client_secret` 等)
- OAuth同意画面の設定が本当に手動のままで問題ないか(新APIで自動化する手段が追加されている可能性)

## Stateの管理

このディレクトリはデフォルトでローカルstate(`terraform.tfstate`、gitignore対象)を使う想定。チームで共有する場合はGCSなどのリモートバックエンドに切り替えること。
