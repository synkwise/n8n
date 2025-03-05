import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

export class SynkwiseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Synkwise Trigger',
		name: 'synkwiseTrigger',
		icon: 'file:synkwise.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers workflow execution based on Synkwise events',
		defaults: {
			name: 'Synkwise Trigger',
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
				path: 'webhook',
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
						description: 'Occurs whenever a document is uploaded to resident profile',
					},
					{
						name: 'Resident Careplan Created',
						value: 'resident.careplan.created',
					},
					{
						name: 'Resident Assessment Created',
						value: 'resident.assessment.created',
					},
					{
						name: 'Manual Execution',
						value: 'manual',
					},
				],
				default: 'resident.document.upload',
				required: true,
			},
			{
				displayName: 'Resident ID (For Manual Execution)',
				name: 'residentId',
				type: 'string',
				default: '',
				placeholder: '12345',
				description: 'Enter Resident ID for manual execution',
				displayOptions: {
					show: {
						event: ['manual'],
					},
				},
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
			throw new Error('Invalid request: Missing required fields (event, resident_id)');
		}

		// Immediately Respond with HTTP 200
		this.getResponseObject().status(200).json({ status: 'Accepted' });

		return {
			workflowData: [
				[
					{
						json: {
							event: eventType,
						},
					},
				],
			],
		};
	}
}
