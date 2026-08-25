variable "project_id" {
  description = "Chrome拡張の公開用に使う既存のGoogle CloudプロジェクトID(事前に作成しておくこと)"
  type        = string
}

variable "support_email" {
  description = "OAuth同意画面に表示するサポート用メールアドレス"
  type        = string
}

variable "application_title" {
  description = "OAuth同意画面に表示するアプリケーション名"
  type        = string
  default     = "bookmark-first release"
}
