import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class PlusNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Plus Node',
		name: 'plusNode',
		group: ['transform'],
		version: 1,
		description: 'Plus Node',
		defaults: {
			name: 'Plus Node',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Number 1',
				name: 'number1', // Must be unique within the node
				type: 'number',
				default: '',
				placeholder: 'Please enter a number',
				description: 'Please enter the first number you want to add',
			},
			{
				displayName: 'Number 2',
				name: 'number2', // Must be unique within the node
				type: 'number',
				default: '',
				placeholder: 'Please enter a number',
				description: 'Please enter the second number you want to add',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let number1: number;
		let number2: number;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				number1 = this.getNodeParameter('number1', itemIndex, 0) as number;
				number2 = this.getNodeParameter('number2', itemIndex, 0) as number;

				item = items[itemIndex];

				item.json.sum = number1 + number2;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
