import { PrismaClient } from '@prisma/client';
import { SettingRequest, SettingResponse, SettingResponseSchema } from '@/types/setting';
import { getCurrentUser, getWorkspace } from '@/utils/common';
import DBClient from '@/lib/db';

export class SettingService {
  private prismaClient: PrismaClient = DBClient.getInstance();

  async findByWorkspaceId(workspaceId: string): Promise<SettingResponse | null> {
    const setting = await this.prismaClient.setting.findFirst({
      where: { workspaceId },
    });

    if (!setting) {
      return null;
    }

    return SettingResponseSchema.parse(setting);
  }

  async save(requestData: SettingRequest, { apiToken }: { apiToken: string }): Promise<void> {
    const currentUser = await getCurrentUser(apiToken);
    if (!currentUser) throw new Error('No user associated with this session');

    const currentWorkspace = await getWorkspace(apiToken);

    const settingByWorkspace = await this.prismaClient.setting.findFirst({
      where: {
        workspaceId: currentWorkspace.id,
      },
    });

    if (!settingByWorkspace) {
      await this.prismaClient.setting.create({
        data: {
          type: requestData.type,
          timezone: requestData.timezone,
          // @ts-ignore
          workingHours: requestData.workingHours,
          message: requestData.message,
          createdById: currentUser.id,
          senderId: requestData.senderId,
          workspaceId: currentWorkspace?.id,
        },
      });

      return;
    }

    await this.prismaClient.setting.update({
      where: {
        id: settingByWorkspace.id,
      },
      data: {
        type: requestData.type,
        timezone: requestData.timezone,
        // @ts-ignore
        workingHours: requestData.workingHours,
        message: requestData.message,
        senderId: requestData.senderId,
        workspaceId: currentWorkspace.id,
      },
    });
  }
}
