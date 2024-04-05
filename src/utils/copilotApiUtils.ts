import { copilotApi } from 'copilot-node-sdk';

import { Message, SendMessageErrorResponse, SendMessageRequest } from '@/types/message';
import appConfig from '@/config/app';
import type { CopilotAPI as SDK } from 'copilot-node-sdk';
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

export class CopilotAPI {
  copilot: SDK;

  constructor(token: string) {
    this.copilot = copilotApi({ apiKey: appConfig.copilotApiKey, token });
  }

  async me(): Promise<MeResponse | null> {
    const tokenPayload = await this.getTokenPayload();
    const id = tokenPayload?.internalUserId || tokenPayload?.clientId;
    if (!tokenPayload || !id) return null;

    const retrieveCurrentUserInfo = tokenPayload.internalUserId
      ? this.copilot.retrieveInternalUser
      : this.copilot.retrieveClient;
    const currentUserInfo = await retrieveCurrentUserInfo({ id });

    return MeResponseSchema.parse(currentUserInfo);
  }

  async getWorkspace(): Promise<WorkspaceResponse> {
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace());
  }

  async getClient(id: string): Promise<ClientResponse> {
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }));
  }

  async getInternalUsers() {
    return InternalUsersResponseSchema.parse(await this.copilot.listInternalUsers({}));
  }

  async getTokenPayload(): Promise<Token | null> {
    const tokenPayload = await this.copilot.getTokenPayload?.();
    return tokenPayload ? TokenSchema.parse(tokenPayload) : null;
  }

  async getCompany(id: string): Promise<CompanyResponse> {
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }));
  }

  async sendMessage(payload: SendMessageRequest): Promise<Partial<Message> | SendMessageErrorResponse> {
    return this.copilot.sendMessage({ requestBody: payload });
  }
}
