/**
 * Google Search Console Credentials Type Definitions
 */

export interface GoogleSearchConsoleCredentials {
  credentials_json: string;
  site_urls?: string[];
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
}

export interface OAuth2Credentials {
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
