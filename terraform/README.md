# terraform

`.github/workflows/release.yml` からChrome Web Store Publish APIを呼び出すために必要な、Google Cloud側のセットアップのうちTerraformで自動化できる部分を管理する。

## このTerraformが自動化するもの / しないもの

**自動化するもの**

- 必要なAPI(`chromewebstore.googleapis.com`)の有効化のみ

**自動化できないもの(手動が必須)**

- **OAuth 2.0クライアントID/シークレットの発行**: `chromewebstore` のような任意スコープを要求できる汎用OAuthクライアントIDをTerraformで作成する手段は、現時点(2026年)では存在しない。
  - `google_iap_brand` / `google_iap_client` はIAP OAuth Admin APIの廃止により使用不可(2026-01-19に機能停止、2026-03-19にAPI自体を完全停止)
  - 後継として案内されている `google_iam_oauth_client` / `google_iam_oauth_client_credential`(IAM OAuth Client API)は、`allowed_scopes` に `https://www.googleapis.com/auth/cloud-platform` と `openid` 程度しか指定できず、`chromewebstore` スコープは拒否される(実機で確認済み)
  - 汎用のOAuth 2.0クライアントIDをTerraformで作成したいという要望自体、HashiCorp側で2023年から未解決のまま残っている([hashicorp/terraform-provider-google#16452](https://github.com/hashicorp/terraform-provider-google/issues/16452))
  - そのため、下記の通りGoogle Cloudコンソールから手動で作成する
- **refresh tokenの取得**: OAuthの認可コードフローは人間がブラウザでGoogleアカウントにログインして同意する操作が必要なため、原理的にTerraformだけでは完結しない
- **Chrome拡張のextension ID**: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) で最初の1回だけ手動でアップロードして登録する必要がある(未登録のアイテムにAPI経由で新規アップロードすることはできない)。2回目以降はCIから`scripts/publish-chrome-webstore.sh`で更新できる

## 使い方

```sh
cd terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して project_id を設定する

terraform init
terraform plan
terraform apply
```

`chromewebstore.googleapis.com` が有効化される。

## OAuth 2.0クライアントIDの作成(手動・初回のみ)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) の「APIとサービス」→「認証情報」を開く(対象プロジェクトを選択した状態で)
2. 初回はOAuth同意画面の設定を求められるので、アプリ名・サポートメールアドレスを設定し、スコープに `https://www.googleapis.com/auth/chromewebstore` を追加、テストユーザーとして自分のGoogleアカウントを登録する(公開ステータスは「テスト」のままでよい)
3. 「認証情報を作成」→「OAuth クライアント ID」を選択
4. アプリケーションの種類は **「ウェブ アプリケーション」** を選択(「デスクトップアプリ」は承認済みリダイレクトURIを自由に設定できないため、後述のOAuth Playgroundが使えない)
5. 「承認済みのリダイレクト URI」に `https://developers.google.com/oauthplayground` を追加して作成する
6. 発行された **クライアントID** / **クライアントシークレット** を、それぞれGitHub Secretsの `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET` に設定する

## refresh tokenの取得手順(手動・初回のみ)

1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) を開く
2. 右上の歯車アイコン(Settings)から「Use your own OAuth credentials」にチェックを入れ、上記のクライアントID / クライアントシークレットを入力する
3. 左側のInput your own scopesに `https://www.googleapis.com/auth/chromewebstore` を入力し、「Authorize APIs」をクリック
4. Chrome Web Storeの対象拡張機能を所有しているGoogleアカウントでログイン・同意する
5. 「Exchange authorization code for tokens」をクリックし、表示された **Refresh token** の値を控える
6. その値をGitHub Secretsに `CHROME_REFRESH_TOKEN` として設定する

## Stateの管理

このディレクトリはデフォルトでローカルstate(`terraform.tfstate`、gitignore対象)を使う想定。チームで共有する場合はGCSなどのリモートバックエンドに切り替えること。
