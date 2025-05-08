import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
	KAKAO_DEFAULT_URLS,
	KAKAO_GET_FRIENDS_URL,
	KAKAO_SEND_MESSAGE_TO_FRIEND_URL,
	KAKAO_SEND_MESSAGE_TO_MYSELF_URL,
} from './KakaoTalkConstants';

export class KakaoTalkNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'KakaoTalk Node',
		name: 'kakaoTalkNode',
		group: ['transform'],
		version: 1,
		description: 'Interact with a kakao talk',
		icon: 'file:kakaoTalkNodeIcon.svg',
		defaults: {
			name: 'KakaoTalk Node',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'kakaoTalkOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Send to Myself', value: 'sendToMyself' },
					{ name: 'Send to Friend', value: 'sendToFriend' },
					{ name: 'Get Friends', value: 'getFriends' },
				],
				default: 'sendToMyself',
				noDataExpression: true,
			},
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Feed', value: 'feed' },
				],
				default: 'text',
				// displayOptions: {
				// 	show: {
				// 		operation: ['sendToMyself', 'sendToFriend'],
				// 	},
				// },
			},
			{
				displayName: 'Receiver UUID',
				name: 'receiverUuid',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['sendToFriend'],
					},
				},
			},
			{
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['sendToMyself', 'sendToFriend'],
						messageType: ['text'],
					},
				},
			},
			/***************
			 * * FEED TYPE *
			 ***************/
			{
				displayName: 'Feed Type',
				name: 'feedType',
				type: 'options',
				options: [
					{ name: 'Feed A', value: 'feedA' },
					{ name: 'Feed B', value: 'feedB' },
				],
				default: 'feedA',
				displayOptions: {
					show: {
						messageType: ['feed'],
					},
				},
			},
			// Feed A
			{
				displayName: 'Title',
				name: 'feedTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'feedDesc',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Image URL',
				name: 'feedImageUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Like Count',
				name: 'likeCount',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Comment Count',
				name: 'commentCount',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Share Count',
				name: 'sharedCount',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Button Title',
				name: 'buttonTitle',
				type: 'string',
				default: '자세히 보기',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Button Web URL',
				name: 'buttonWebUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			{
				displayName: 'Button Mobile URL',
				name: 'buttonMobileUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedA'],
					},
				},
			},
			// Feed B
			{
				displayName: 'Profile Text',
				name: 'profileText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
				},
			},
			{
				displayName: 'Item Title',
				name: 'itemTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
				},
			},
			{
				displayName: 'Item Category',
				name: 'itemCategory',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
				},
			},
			{
				displayName: 'Item Image URL',
				name: 'itemImageUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
				},
			},
			{
				displayName: 'Items (Name - Price)',
				name: 'feedItemsJson',
				type: 'string',
				default: '[{"item":"Price","item_op":"7,500원"},{"item":"할인","item_op":"-500원"}]',
				description: 'Enter array of items in JSON format: [{"item":"name","item_op":"price"}]',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
				},
			},
			{
				displayName: 'Total Label',
				name: 'sum',
				type: 'string',
				default: '합계',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
				},
			},
			{
				displayName: 'Total Value',
				name: 'sumOp',
				type: 'string',
				default: '7,000원',
				displayOptions: {
					show: {
						messageType: ['feed'],
						feedType: ['feedB'],
					},
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
				let template: any;

				if (operation === 'getFriends') {
					const response = await this.helpers.requestWithAuthentication.call(
						this,
						'kakaoTalkOAuth2Api',
						{
							method: 'GET',
							url: KAKAO_GET_FRIENDS_URL,
						},
					);

					const parsed = typeof response === 'string' ? JSON.parse(response) : response;

					if (Array.isArray(parsed.elements)) {
						for (const friend of parsed.elements) {
							returnData.push({ json: friend });
						}
					} else {
						returnData.push({ json: parsed });
					}

					continue;
				}

				const messageType = this.getNodeParameter('messageType', i) as string;

				if (messageType === 'text') {
					const messageText = this.getNodeParameter('messageText', i) as string;
					template = {
						object_type: 'text',
						text: messageText,
						link: {
							web_url: KAKAO_DEFAULT_URLS.developer_url,
							mobile_web_url: KAKAO_DEFAULT_URLS.developer_url,
						},
						button_title: 'Visit',
					};
				} else if (messageType === 'feed') {
					const feedType = this.getNodeParameter('feedType', i);
					if (feedType === 'feedA') {
						const social: Record<string, number> = {};
						const likeCount = this.getNodeParameter('likeCount', i) as number;
						const commentCount = this.getNodeParameter('commentCount', i) as number;
						const sharedCount = this.getNodeParameter('sharedCount', i) as number;

						if (likeCount) social.like_count = likeCount;
						if (commentCount) social.comment_count = commentCount;
						if (sharedCount) social.shared_count = sharedCount;

						template = {
							object_type: 'feed',
							content: {
								title: this.getNodeParameter('feedTitle', i),
								description: this.getNodeParameter('feedDesc', i),
								image_url: this.getNodeParameter('feedImageUrl', i),
								link: {
									web_url: KAKAO_DEFAULT_URLS.developer_url,
									mobile_web_url: KAKAO_DEFAULT_URLS.developer_url,
								},
							},
							social,
							buttons: [
								{
									title: this.getNodeParameter('buttonTitle', i),
									link: {
										web_url: this.getNodeParameter('buttonWebUrl', i),
										mobile_web_url: this.getNodeParameter('buttonMobileUrl', i),
									},
								},
							],
						};
					} else if (feedType === 'feedB') {
						const feedItemsJson = this.getNodeParameter('feedItemsJson', i);
						const feedItems = JSON.parse(feedItemsJson as string);

						template = {
							object_type: 'feed',
							content: {
								title: this.getNodeParameter('itemTitle', i),
								description: this.getNodeParameter('itemCategory', i),
								image_url: this.getNodeParameter('itemImageUrl', i),
								link: {
									web_url: KAKAO_DEFAULT_URLS.developer_url,
									mobile_web_url: KAKAO_DEFAULT_URLS.developer_url,
								},
							},
							item_content: {
								profile_text: this.getNodeParameter('profileText', i),
								items: feedItems,
								sum: this.getNodeParameter('sum', i),
								sum_op: this.getNodeParameter('sumOp', i),
							},
							button_title: '자세히 보기',
						};
					}
				}

				const form: Record<string, string> = {
					template_object: JSON.stringify(template),
				};

				let url = '';
				if (operation === 'sendToMyself') {
					url = KAKAO_SEND_MESSAGE_TO_MYSELF_URL;
				} else if (operation === 'sendToFriend') {
					const receiverUuid = this.getNodeParameter('receiverUuid', i) as string;
					form.receiver_uuids = JSON.stringify([receiverUuid]);
					url = KAKAO_SEND_MESSAGE_TO_FRIEND_URL;
				}

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'kakaoTalkOAuth2Api',
					{
						method: 'POST',
						url,
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
						},
						form,
					},
				);

				const parsed = typeof response === 'string' ? JSON.parse(response) : response;
				returnData.push({ json: parsed });
			} catch (error) {
				console.log('error>>>>>>>>>>>>>>>>>', error);
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
