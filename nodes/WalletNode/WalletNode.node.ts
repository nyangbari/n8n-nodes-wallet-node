import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { ethers } from 'ethers';

export class WalletNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wallet Node',
		name: 'walletNode',
		group: ['transform'],
		version: 1,
		description: 'Interact with a blockchain wallet',
		icon: 'file:walletNodeIcon.svg',
		defaults: {
			name: 'Wallet Node',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'walletCredentialsApi',
				required: true,
				displayOptions: {
					show: {
						operation: ['sendTransaction'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'RPC URL',
				name: 'rpcUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://mainnet.infura.io/v3/YOUR_KEY',
			},
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Get Balance', value: 'getBalance' },
					{ name: 'Send Transaction', value: 'sendTransaction' },
				],
				default: 'getBalance',
			},
			{
				displayName: 'Wallet Address',
				name: 'walletAddress',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { operation: ['getBalance'] },
				},
			},
			{
				displayName: 'To Address',
				name: 'toAddress',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { operation: ['sendTransaction'] },
				},
			},
			{
				displayName: 'Amount (ETH)',
				name: 'amount',
				type: 'number',
				default: 0.01,
				required: true,
				displayOptions: {
					show: { operation: ['sendTransaction'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const rpcUrl = this.getNodeParameter('rpcUrl', i) as string;
				const provider = new ethers.JsonRpcProvider(rpcUrl);

				if (operation === 'getBalance') {
					const walletAddress = this.getNodeParameter('walletAddress', i) as string;
					const balanceWei = await provider.getBalance(walletAddress);
					const balanceEther = ethers.formatEther(balanceWei);
					returnData.push({ json: { balanceWei: balanceWei.toString(), balanceEther } });
				}

				if (operation === 'sendTransaction') {
					const toAddress = this.getNodeParameter('toAddress', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;

					const credentials = await this.getCredentials('walletCredentialsApi');
					const privateKey = credentials.privateKey as string;

					const wallet = new ethers.Wallet(privateKey, provider);
					const tx = await wallet.sendTransaction({
						to: toAddress,
						value: ethers.parseEther(amount.toString()),
					});

					returnData.push({ json: { txHash: tx.hash } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: items[i].json,
						error: error.message,
						pairedItem: i,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}
