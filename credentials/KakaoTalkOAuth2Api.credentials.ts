import type { ICredentialType, INodeProperties } from 'n8n-workflow';
import { KAKAO_DEFAULT_URLS } from '../nodes/KakaoTalkNode/KakaoTalkConstants';

export class KakaoTalkOAuth2Api implements ICredentialType {
	name = 'kakaoTalkOAuth2Api';
	displayName = 'KakaoTalk OAuth2 API';
	extends = ['oAuth2Api'];
	documentationUrl = KAKAO_DEFAULT_URLS.documentation_url;

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			required: true,
			default: '',
			description: 'Your Kakao REST API Key',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'Leave empty if your app does not use a client secret',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'talk_message friends',
			required: true,
		},
		{
			displayName: 'Auth URI',
			name: 'authUrl',
			type: 'hidden',
			default: KAKAO_DEFAULT_URLS.oauth_url,
		},
		{
			displayName: 'Access Token URI',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: KAKAO_DEFAULT_URLS.access_token_url,
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];

	credentials = {
		oauth2: {
			grantType: 'authorizationCode',
			accessTokenPropertyName: 'access_token',
			refreshTokenPropertyName: 'refresh_token',
		},
	};
}
