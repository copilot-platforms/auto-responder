import { copilotApi } from 'copilot-node-sdk';

import { Message, SendMessageErrorResponse, SendMessageRequest } from '@/types/message';
import appConfig from '@/config/app';
import { DefaultService as Copilot } from 'copilot-node-sdk/codegen/api/services/DefaultService';
import {
  ClientResponse,
  ClientResponseSchema,
  CompanyResponse,
  CompanyResponseSchema,
  InternalUsersResponseSchema,
  MeResponse,
  MeResponseSchema,
  Token,
  TokenSchema,
  WorkspaceResponse,
  WorkspaceResponseSchema,
} from '@/types/common';

type SDK = typeof Copilot & { getTokenPayload?: () => Promise<Token> };

export class CopilotAPI {
  copilot: SDK;

  constructor(apiToken: string) {
    this.copilot = copilotApi({
      apiKey: appConfig.copilotApiKey,
      token: apiToken,
    });
  }

  async me(): Promise<MeResponse> {
    return MeResponseSchema.parse(await this.copilot.getUserInfo());
  }

  async getWorkspace(): Promise<WorkspaceResponse> {
    return WorkspaceResponseSchema.parse(await this.copilot.getWorkspaceInfo());
  }

  async getClient(clientId: string): Promise<ClientResponse> {
    return ClientResponseSchema.parse(await this.copilot.retrieveAClient({ id: clientId }));
  }

  async getInternalUsers() {
    return InternalUsersResponseSchema.parse(await this.copilot.listInternalUsers({}));
  }

  async getTokenPayload() {
    const tokenPayload = await this.copilot.getTokenPayload?.();
    return tokenPayload ? TokenSchema.parse(tokenPayload) : null;
  }

  async getCompany(companyId: string): Promise<CompanyResponse> {
    return CompanyResponseSchema.parse(await this.copilot.retrieveACompany({ id: companyId }));
  }

  async sendMessage(payload: SendMessageRequest): Promise<Partial<Message> | SendMessageErrorResponse> {
    return this.copilot.sendAMessage({ requestBody: payload });
  }
}
