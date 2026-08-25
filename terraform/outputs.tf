# GitHub SecretsのCHROME_CLIENT_IDに設定する値の候補。
# oauth_client_id は自分で指定したID(main.tf参照)、id はTerraformが管理するリソースID。
# OAuth 2.0 Playgroundの Client ID 欄にどちらを使うべきかは、GCPコンソールの
# 「APIとサービス」→「認証情報」で発行されたクライアントの表示と突き合わせて確認すること。
output "oauth_client_id" {
  description = "作成したOAuthクライアントのID(自分で指定した値)"
  value       = google_iam_oauth_client.chrome_webstore.oauth_client_id
}

output "oauth_client_resource_id" {
  description = "TerraformリソースID(Console上のクライアントIDと照合して使う)"
  value       = google_iam_oauth_client.chrome_webstore.id
}

output "oauth_client_secret" {
  description = "GitHub SecretsのCHROME_CLIENT_SECRETに設定する値"
  value       = google_iam_oauth_client_credential.chrome_webstore.client_secret
  sensitive   = true
}
