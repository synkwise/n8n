import moment from 'moment-timezone';
import {
	type IDataObject,
	type IExecuteFunctions,
	ILoadOptionsFunctions,
	type INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	type INodeTypeBaseDescription,
	INodeTypeDescription,
	type JsonObject,
	NodeConnectionType,
} from 'n8n-workflow';
import { documentFields, documentOperations } from './DocumentDescription';
import { inspectionFields, inspectionOperations } from './InspectionDescription';
import { residentFields, residentOperations } from './ResidentDescription';

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
			async getSystemDocumentsName(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = (await this.getCredentials('synkwiseApi')) as {
					environment: string;
					apiKey: string;
					customBaseUrl: string;
				};

				const apiBaseUrl =
					credentials.environment === 'custom'
						? credentials.customBaseUrl
						: credentials.environment;
				const apiKey = credentials.apiKey as string;
				const endpoint = `${apiBaseUrl}/api/internal/v1/inspection/options/system-folders`;

				try {
					const response = await this.helpers.request({
						method: 'GET',
						url: endpoint,
						headers: {
							'X-API-KEY': apiKey,
							'Content-Type': 'application/json',
						},
						json: true,
					});

					return response.map((doc: { value: string; name: string }) => ({
						name: doc.name,
						value: doc.value,
					}));
				} catch (error) {
					throw new Error(`Failed to fetch document names: ${(error as JsonObject).message}`);
				}
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
		const apiBaseUrl =
			credentials.environment === 'custom' ? credentials.customBaseUrl : credentials.environment;
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
							},
						});
					}
				}

				if (resource === 'doc') {
					if (operation === 'get') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject; // Extract all filters
						const queryParams: IDataObject = { ...filters };
						const endpoint = `${apiBaseUrl}/api/internal/v1/documents/q`;
						const docs = await this.helpers.request({
							method: 'GET',
							url: endpoint,
							headers: {
								'X-API-KEY': apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
							qs: queryParams,
						});

						responseData = [docs];
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
