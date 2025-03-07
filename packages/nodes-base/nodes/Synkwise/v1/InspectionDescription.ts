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
	{
		displayName: 'Workflow Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Workflow Started',
				value: 'execution.status.started',
			},
			{
				name: 'Workflow Is Running',
				value: 'execution.status.running',
			},
			{
				name: 'Workflow Succeeded',
				value: 'execution.status.succeeded',
			},
			{
				name: 'Workflow Failed',
				value: 'execution.status.failed',
			},
		],
		displayOptions: {
			show: {
				operation: ['inspection.result.update'],
				resource: ['inspection'],
			},
		},
		default: 'execution.status.running',
		required: true,
		description: 'Send Workflow Status To Synkwise',
	},
	{
		displayName: 'Inspection Error Name or ID',
		name: 'inspectionError',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getInspectionErrorsOptions',
		},
		options: [
			{
				name: 'None', // User-friendly label for "no selection"
				value: '', // Unique value for the "empty" option
			},
		],
		displayOptions: {
			show: {
				operation: ['inspection.result.update'],
				resource: ['inspection'],
			},
		},
		default: '',
		description: 'Send Inspection Error (Optional)',
		required: false,
	},
	{
		displayName: 'System Folder',
		name: 'systemFolder',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getInspectionSystemFoldersOptions',
		},
		options: [
			{
				name: 'None', // User-friendly label for "no selection"
				value: '', // Unique value for the "empty" option
			},
		],
		displayOptions: {
			show: {
				operation: ['inspection.result.update'],
				resource: ['inspection'],
			},
		},
		default: '',
		description: 'Configure Synkwise System Folder',
		required: false,
	},
];
