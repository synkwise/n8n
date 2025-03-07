export function getBaseUrl(credentials: { environment: string; customBaseUrl: string }): string {
	return credentials.environment === 'custom' ? credentials.customBaseUrl : credentials.environment;
}
