import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	INodeType,
	type INodeTypeBaseDescription,
	INodeTypeDescription,
	type JsonObject,
	NodeConnectionType,
} from 'n8n-workflow';
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
				...residentOperations,
				...residentFields,
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
					],
					default: 'resident',
				},
			],
		};
	}

	methods = {
		loadOptions: {},
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
