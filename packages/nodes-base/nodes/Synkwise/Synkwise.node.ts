import {
	type INodeTypeBaseDescription,
	type IVersionedNodeType,
	VersionedNodeType,
} from 'n8n-workflow';
import { SynkwiseV1 } from './v1/Synkwise.node';

export class Synkwise extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Synkwise',
			name: 'synkwise',
			icon: 'file:synkwise.svg',
			group: ['output'],
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
			description: 'Consume Synkwise API',
			defaultVersion: 1,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			1: new SynkwiseV1(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
