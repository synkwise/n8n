import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

export class SynkwiseWebhookTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Synkwise Webhook Trigger',
		name: 'synkwiseWebhookTrigger',
		icon: 'file:synkwise.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers workflow execution based on Synkwise events',
		defaults: {
			name: 'Synkwise Webhook Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'synkwiseApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '',
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				description: 'The event to listen to',
				options: [
					{
						name: 'Resident Document Upload',
						value: 'resident.document.upload',
						description: 'Occurs whenever a document is uploaded to a resident profile',
					},
					{
						name: 'Resident Careplan Created',
						value: 'resident.careplan.created',
					},
					{
						name: 'Resident Assessment Created',
						value: 'resident.assessment.created',
					},
				],
				default: 'resident.document.upload',
				required: true,
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const headers = req.headers;
		const credentials = await this.getCredentials('synkwiseApi');
		const apiKey = credentials?.apiKey as string;

		// Validate API Key
		if (!apiKey || headers.authorization !== `Bearer ${apiKey}`) {
			throw new Error('Unauthorized: Invalid API Key');
		}

		const eventType = req.body.event;

		// Validate Payload
		if (!eventType) {
			throw new Error('Invalid request: Missing event type');
		}

		// Immediately Respond with HTTP 200
		this.getResponseObject().status(200).json({ status: 'Accepted' });

		return {
			workflowData: [
				[
					{
						json: req.body,
					},
				],
			],
		};
	}
}
