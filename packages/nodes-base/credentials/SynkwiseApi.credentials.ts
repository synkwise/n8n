import { ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';

export class SynkwiseApi implements ICredentialType {
	name = 'synkwiseApi';

	displayName = 'Synkwise API';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Local (Custom)', value: 'custom' },
				{ name: 'Test', value: 'https://api.synkwise.test' },
				{ name: 'Stage', value: 'https://api.synkwise.stage' },
				{ name: 'Production', value: 'https://api.synkwise.dev' },
			],
			default: 'https://api.synkwise.dev',
			description: 'Select the environment for Synkwise API',
		},
		{
			displayName: 'Custom Local API URL',
			name: 'customBaseUrl',
			type: 'string',
			default: process.env.N8N_LOCAL_API_URL || 'http://localhost:3000',
			placeholder: 'http://your-local-api:4000',
			description: 'Enter the custom API URL for local development',
			displayOptions: {
				show: {
					environment: ['custom'],
				},
			},
		},
	];

	// ✅ Add a test connection feature
	// test: ICredentialTestRequest = {
	// 	request: {
	// 		baseURL: '={{$credentials.environment === "custom" ? $credentials.customBaseUrl : $credentials.environment}}',
	// 		url: '/health',
	// 		method: 'GET',
	// 		headers: {
	// 			Authorization: 'Bearer {{$credentials.apiKey}}',
	// 		},
	// 	},
	// };
}
