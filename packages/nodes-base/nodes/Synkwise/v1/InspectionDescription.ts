import type { INodeProperties } from 'n8n-workflow';

export const inspectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['inspection'],
			},
		},
		options: [
			{
				name: 'Update Inspection Results',
				value: 'inspection.result.update',
				action: 'Update Result',
			},
		],
		default: 'inspection.result.update',
	},
];

export const inspectionFields: INodeProperties[] = [
	{
		displayName: 'Executed ID',
		name: 'executionId',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['inspection.result.update'],
				resource: ['inspection'],
			},
		},
		default: '={{$execution.id}}',
		required: true,
		description: 'Updates Inspection Result by Execution ID',
	},
	{
		displayName: 'Payload',
		name: 'payload',
		type: 'json',
		displayOptions: {
			show: {
				operation: ['inspection.result.update'],
				resource: ['inspection'],
			},
		},
		default: '={{$execution.id}}',
		required: true,
		description: 'Execution Result Payload',
	},
];
