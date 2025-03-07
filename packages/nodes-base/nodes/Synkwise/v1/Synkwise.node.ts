import moment from 'moment-timezone';
import {
	type IDataObject,
	type IExecuteFunctions,
	ILoadOptionsFunctions,
	type INodeExecutionData,
	INodeType,
	type INodeTypeBaseDescription,
	INodeTypeDescription,
	type JsonObject,
	NodeConnectionType,
} from 'n8n-workflow';
import { documentFields, documentOperations } from './DocumentDescription';
import { inspectionFields, inspectionOperations } from './InspectionDescription';
import { residentFields, residentOperations } from './ResidentDescription';
import { getBaseUrl } from '../credentials-helper';

export class SynkwiseV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			version: 1,
			defaults: {
				name: 'Synkwise',
			},
			inputs: [NodeConnectionType.Main],
			outputs: [NodeConnectionType.Main],
			credentials: [
				{
					name: 'synkwiseApi',
					required: true,
				},
			],
			properties: [
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Resident',
							value: 'resident',
						},
						{
							name: 'Inspection',
							value: 'inspection',
						},
						{
							name: 'Document',
							value: 'doc',
						},
					],
					default: 'resident',
				},
				...documentOperations,
				...documentFields,
				...residentOperations,
				...residentFields,
				...inspectionOperations,
				...inspectionFields,
			],
		};
	}

	methods = {
		loadOptions: {
			async getInspectionErrorsOptions(this: ILoadOptionsFunctions) {
				const credentials = (await this.getCredentials('synkwiseApi')) as {
					environment: string;
					apiKey: string;
					customBaseUrl: string;
				};
				const apiBaseUrl = getBaseUrl(credentials);
				const endpoint = `${apiBaseUrl}/api/internal/v1/inspection/options/errors`;
				const apiKey = credentials.apiKey as string;

				const response = await this.helpers.request({
					method: 'GET',
					url: endpoint,
					headers: {
						'X-API-KEY': apiKey,
						'Content-Type': 'application/json',
					},
					json: true,
				});

				// Ensure response is an array
				if (!Array.isArray(response)) {
					throw new Error('Invalid response format from Synkwise API');
				}

				// Map response to n8n options format
				return [
					{
						name: 'None',
						value: '',
					},
					...response.map((error: { value: string; name: string }) => ({
						name: error.name,
						value: error.value,
					})),
				];
			},
			async getSystemDocumentsName(this: ILoadOptionsFunctions) {
				const credentials = (await this.getCredentials('synkwiseApi')) as {
					environment: string;
					apiKey: string;
					customBaseUrl: string;
				};
				const apiBaseUrl = getBaseUrl(credentials);
				const endpoint = `${apiBaseUrl}/api/internal/v1/inspection/options/system-folders`;
				const apiKey = credentials.apiKey as string;

				const response = await this.helpers.request({
					method: 'GET',
					url: endpoint,
					headers: {
						'X-API-KEY': apiKey,
						'Content-Type': 'application/json',
					},
					json: true,
				});

				// Ensure response is an array
				if (!Array.isArray(response)) {
					throw new Error('Invalid response format from Synkwise API');
				}

				// Map response to n8n options format
				return [
					{
						name: 'None',
						value: '',
					},
					...response.map((error: { value: string; name: string }) => ({
						name: error.name,
						value: error.value,
					})),
				];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		let responseData;
		const credentials = (await this.getCredentials('synkwiseApi')) as {
			environment: string;
			apiKey: string;
			customBaseUrl: string;
		};
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		const apiBaseUrl = getBaseUrl(credentials);
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < length; i++) {
			try {
				responseData = {
					error: 'Resource ' + resource + ' / operation ' + operation + ' not found!',
				};
				// qs = {};
				if (resource === 'resident') {
					if (operation === 'resident.profile.get') {
						const residentId = this.getNodeParameter('residentId', i) as string;

						const staticData = this.getWorkflowStaticData('global');
						staticData.ownerId = residentId;

						const endpoint = `${apiBaseUrl}/api/internal/v1/residents/${residentId}`;
						const residentProfile = await this.helpers.request({
							method: 'GET',
							url: endpoint,
							headers: {
								'X-API-KEY': apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
						});
						responseData = [residentProfile];
					}
				}

				if (resource === 'inspection') {
					if (operation === 'inspection.result.update') {
						const executionId = this.getNodeParameter('executionId', i) as string;
						const payload = this.getNodeParameter('payload', i) as {};
						const status = this.getNodeParameter('status', i) as string;
						const staticData = this.getWorkflowStaticData('global');
						const ruleId = staticData?.ruleId;
						const ownerId = staticData?.ownerId;

						const endpoint = `${apiBaseUrl}/api/internal/v1/inspection/execs`;

						const triggerOnUtc = moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
						await this.helpers.request({
							method: 'POST',
							url: endpoint,
							headers: {
								'X-API-KEY': apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
							body: {
								executionId,
								payload,
								triggerOnUtc,
								status,
								ruleId,
								ownerId,
							},
						});
					}
				}

				if (resource === 'doc') {
					if (operation === 'get') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject; // Extract all filters
						const queryParams: IDataObject = { ...filters };
						const endpoint = `${apiBaseUrl}/api/internal/v1/documents/q`;
						const docs: any[] = await this.helpers.request({
							method: 'GET',
							url: endpoint,
							headers: {
								'X-API-KEY': apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
							qs: queryParams,
						});

						responseData = [docs[0]];
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as JsonObject).message } });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
