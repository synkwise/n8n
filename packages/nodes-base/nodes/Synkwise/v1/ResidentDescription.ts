import type { INodeProperties } from 'n8n-workflow';

export const residentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['resident'],
			},
		},
		options: [
			{
				name: 'Get Profile',
				value: 'resident.profile.get',
				description: 'Get Resident Profile Details',
				action: 'Get profile',
			},
		],
		default: 'resident.profile',
	},
];

export const residentFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                channel:archive                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Resident Name or ID',
		name: 'residentId',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['resident.profile.get'],
				resource: ['resident'],
			},
		},
		default: '',
		required: true,
		description: 'Fetches Resident Profile',
	},
];
