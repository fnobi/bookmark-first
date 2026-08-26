# Chrome Web Store Publish APIを呼び出すために必要なAPIを有効化する
resource "google_project_service" "chromewebstore" {
  project            = var.project_id
  service            = "chromewebstore.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam" {
  project            = var.project_id
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

# Chrome Web Store Publish API呼び出し用のOAuth 2.0クライアント。
#
# 旧来の google_iap_brand / google_iap_client は、IAP OAuth Admin APIの廃止
# (2026-01-19に機能停止、2026-03-19にAPI自体を完全停止)に伴い使用できないため、
# 後継の IAM OAuth Client API ベースのリソースに置き換えている。
resource "google_iam_oauth_client" "chrome_webstore" {
  project = var.project_id

  oauth_client_id = "bookmark-first-webstore"
  location        = "global"
  display_name    = "bookmark-first webstore" # 32文字以内という制約があるため短縮
  description     = "Chrome Web Store Publish API用のOAuthクライアント"

  client_type = "CONFIDENTIAL_CLIENT"
  allowed_grant_types = [
    "AUTHORIZATION_CODE_GRANT",
    "REFRESH_TOKEN_GRANT",
  ]
  allowed_scopes = [
    "https://www.googleapis.com/auth/chromewebstore",
  ]
  # OAuth 2.0 Playground経由でrefresh tokenを取得するために必要(terraform/README.md参照)
  allowed_redirect_uris = [
    "https://developers.google.com/oauthplayground",
  ]

  depends_on = [google_project_service.iam]
}

resource "google_iam_oauth_client_credential" "chrome_webstore" {
  project = var.project_id

  oauthclient = google_iam_oauth_client.chrome_webstore.oauth_client_id
  location    = google_iam_oauth_client.chrome_webstore.location

  oauth_client_credential_id = "default"
  display_name               = "release credential" # 32文字以内という制約があるため短縮
}
