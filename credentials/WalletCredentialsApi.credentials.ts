import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class WalletCredentialsApi implements ICredentialType {
	name = 'walletCredentialsApi';
	displayName = 'Wallet Credentials API';
	properties: INodeProperties[] = [
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
