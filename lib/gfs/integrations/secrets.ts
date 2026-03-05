// GFS Integrations - Secrets Manager
// Uses environment variables for secrets configuration

/**
 * Get a specific secret value from environment variables
 * Environment variables follow the pattern: {SERVICE}_{SECRET_NAME}
 * e.g., TELEGRAM_BOT_TOKEN, TWILIO_ACCOUNT_SID, GITHUB_PAT
 */
export function getSecret(serviceName: string, secretName: string): string | null {
  const envKey = `${serviceName.toUpperCase()}_${secretName.toUpperCase()}`;
  return process.env[envKey] || null;
}

/**
 * Check if a service has configured secrets
 */
export function hasSecrets(serviceName: string): boolean {
  const servicePrefix = serviceName.toUpperCase() + '_';
  return Object.keys(process.env).some(key => key.startsWith(servicePrefix));
}

/**
 * Get all secret names for a service (from environment)
 */
export function getSecretNames(serviceName: string): string[] {
  const servicePrefix = serviceName.toUpperCase() + '_';
  return Object.keys(process.env)
    .filter(key => key.startsWith(servicePrefix))
    .map(key => key.slice(servicePrefix.length).toLowerCase());
}

/**
 * Clear the secrets cache (no-op, environment variables are always fresh)
 */
export function clearSecretsCache(): void {
  // No-op - environment variables don't need caching
}
