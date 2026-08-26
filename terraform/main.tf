# Chrome Web Store Publish APIを呼び出すために必要なAPIを有効化する
resource "google_project_service" "chromewebstore" {
  project            = var.project_id
  service            = "chromewebstore.googleapis.com"
  disable_on_destroy = false
}
