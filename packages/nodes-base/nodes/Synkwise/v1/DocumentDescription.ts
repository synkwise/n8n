import type { INodeProperties } from 'n8n-workflow';

export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['doc'], // resource
			},
		},
		options: [
			{
				name: 'Get Documents',
				value: 'get', // operation
				description: 'Get Documents from Synkwise',
				action: 'Get documents',
			},
		],
		default: 'get', // operation
	},
];

export const documentFields: INodeProperties[] = [
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['doc'], // resource
				operation: ['get'], // operation
			},
		},
		options: [
			{
				displayName: 'System Document Name',
				name: 'systemFolderName',
				description: 'Syst doc name',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getSystemDocumentsName',
				},
			},
			{
				displayName: 'Owner Type',
				name: 'ownerType',
				description: 'Resident / Facility / Identity',
				type: 'options',
				default: 1,
				options: [
					{
						name: 'Resident',
						value: 1,
						description: '',
					},
					{
						name: 'Identity',
						value: 2,
						description: '',
					},
					{
						name: 'Facility',
						value: 3,
						description: '',
					},
				],
			},
			{
				displayName: 'Owner Id',
				name: 'ownerId',
				type: 'number',
				default: '={{ $json.id }}',
				description: 'Resident / Facility / Identity ID',
			},
		],
	},
];
