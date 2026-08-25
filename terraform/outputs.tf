output "oauth_client_id" {
  description = "GitHub SecretsのCHROME_CLIENT_IDに設定する値"
  value       = google_iap_client.chrome_webstore.client_id
}

output "oauth_client_secret" {
  description = "GitHub SecretsのCHROME_CLIENT_SECRETに設定する値"
  value       = google_iap_client.chrome_webstore.secret
  sensitive   = true
}
