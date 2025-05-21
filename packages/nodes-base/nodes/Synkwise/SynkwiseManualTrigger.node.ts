import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeConnectionType,
} from 'n8n-workflow';

export class SynkwiseManualTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Synkwise Manual Trigger',
		name: 'synkwiseManualTrigger',
		icon: 'file:synkwise.svg',
		group: ['trigger'],
		version: 1,
		description: 'Manually triggers workflow execution for Synkwise events',
		defaults: {
			name: 'Synkwise Manual Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resident ID',
				name: 'residentId',
				type: 'string',
				default: '',
				placeholder: '12345',
				description: 'Enter Resident ID for manual execution',
				required: true,
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const residentId = this.getNodeParameter('residentId') as string;

		return {
			closeFunction: async () => {}, // No cleanup needed
			manualTriggerFunction: async () => {
				this.emit([
					[
						{
							json: {
								event: 'manual',
								residentId,
							},
						},
					],
				]);
			},
		};
	}
}
