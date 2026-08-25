# Chrome Web Store Publish APIを呼び出すために必要なAPIを有効化する
resource "google_project_service" "chromewebstore" {
  project            = var.project_id
  service            = "chromewebstore.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iap" {
  project            = var.project_id
  service            = "iap.googleapis.com"
  disable_on_destroy = false
}

# OAuth同意画面(ブランド)。1プロジェクトにつき1つのみ作成可能。
# 既にOAuth同意画面を設定済みのプロジェクトを使う場合は、この resource ではなく
# `terraform import google_iap_brand.default <name>` で既存のものを取り込むこと。
resource "google_iap_brand" "default" {
  project           = var.project_id
  support_email     = var.support_email
  application_title = var.application_title

  depends_on = [google_project_service.iap]
}

# Chrome Web Store Publish API呼び出し用のOAuth 2.0クライアント。
# 本来はIAP(Identity-Aware Proxy)用のリソースだが、実体は汎用のOAuth 2.0
# クライアントID/シークレットが払い出されるため、他のGoogle APIのOAuth認可にも利用できる。
# 発行されたclient_id/client_secretを使ってrefresh tokenを取得する手順は
# terraform/README.md を参照。
resource "google_iap_client" "chrome_webstore" {
  display_name = "bookmark-first chrome webstore release"
  brand        = google_iap_brand.default.name
}
