import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { ethers } from 'ethers';

export class WalletBalanceNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wallet Balance Node',
		name: 'walletBalanceNode',
		group: ['transform'],
		version: 1,
		description: 'Get wallet balance from a blockchain',
		defaults: {
			name: 'Wallet Balance Node',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'RPC URL',
				name: 'rpcUrl',
				type: 'string',
				default: '',
				placeholder: 'https://mainnet.infura.io/v3/your-api-key',
				description: 'RPC endpoint of the blockchain',
				required: true,
			},
			{
				displayName: 'Wallet Address',
				name: 'walletAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Wallet address to check the balance for',
				required: true,
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
		let rpcUrl: string;
		let walletAddress: string;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				rpcUrl = this.getNodeParameter('rpcUrl', itemIndex, '') as string;
				walletAddress = this.getNodeParameter('walletAddress', itemIndex, '') as string;

				const provider = new ethers.JsonRpcProvider(rpcUrl);
				const balanceWei = await provider.getBalance(walletAddress);
				const balanceEther = ethers.formatEther(balanceWei);

				item = items[itemIndex];
				item.json.balanceWei = balanceWei.toString();
				item.json.balanceEther = balanceEther;
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
