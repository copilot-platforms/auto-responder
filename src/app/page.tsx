import { $Enums } from '@prisma/client';

import { HOUR, SettingsData } from '@/constants';
import { SettingResponse } from '@/types/setting';
import AutoResponder from '@/app/components/AutoResponder';
import { SettingService } from '@/app/api/settings/services/setting.service';
import { CopilotAPI } from '@/utils/copilotApiUtils';
import { ClientResponse, CompanyResponse, InternalUsers, InternalUser, WorkspaceResponse } from '@/types/common';
import { z } from 'zod';
import appConfig from '@/config/app';
import InvalidToken from './components/InvalidToken';

type SearchParams = { [key: string]: string | string[] | undefined };

const settingsService = new SettingService();

async function getContent(searchParams: SearchParams): Promise<{
  client?: ClientResponse;
  company?: CompanyResponse;
  workspace?: WorkspaceResponse;
  currentUserId?: string;
}> {
  if (!searchParams.token) {
    return {
      client: undefined,
      company: undefined,
    };
  }

  const copilotAPI = new CopilotAPI(z.string().parse(searchParams.token));
  const result: {
    client?: ClientResponse;
    company?: CompanyResponse;
    workspace?: WorkspaceResponse;
    currentUserId?: string;
  } = {};

  const payload = await copilotAPI.getTokenPayload();
  if (payload) {
    result.currentUserId = payload?.internalUserId;
  }

  result.workspace = await copilotAPI.getWorkspace();

  if (searchParams.clientId && typeof searchParams.clientId === 'string') {
    result.client = await copilotAPI.getClient(searchParams.clientId);
  }

  if (searchParams.companyId && typeof searchParams.companyId === 'string') {
    result.company = await copilotAPI.getCompany(searchParams.companyId);
  }

  return result;
}

const populateSettingsFormData = (settings: SettingResponse, currentUserId?: string): SettingsData => {
  return {
    autoRespond: settings?.type || $Enums.SettingType.DISABLED,
    response: settings?.message || null,
    timezone: settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    selectedDays: (settings?.workingHours || [])?.map((workingHour) => ({
      day: workingHour.weekday,
      startHour: workingHour.startTime as HOUR,
      endHour: workingHour.endTime as HOUR,
    })),
    // If no senderId in settings (like in new workspace), default to current user
    senderId: settings?.senderId || currentUserId || '',
  };
};

async function getInternalUsers(token: string): Promise<InternalUsers> {
  const res = await fetch(`${appConfig.apiUrl}/api/internal-users?token=${token}`);
  return await res.json();
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const token = z.string().safeParse(searchParams.token);
  if (!token.success) {
    return <InvalidToken />;
  }

  const { workspace, currentUserId } = await getContent(searchParams);
  const internalUsers = await getInternalUsers(searchParams.token as string);

  let internalUsersWithClientAccessLimitedFalse: InternalUsers = { data: [] };
  if (internalUsers.data) {
    let _internalUsers = internalUsers.data.filter((user: InternalUser) => user.isClientAccessLimited !== true);
    internalUsersWithClientAccessLimitedFalse = { data: _internalUsers };
  }

  const setting = await settingsService.findByWorkspaceId(workspace?.id as string);
  const saveSettings = async (data: SettingsData) => {
    'use server';
    const setting = {
      type: data.autoRespond,
      message: data.response,
      timezone: data.timezone,
      workingHours: Array.isArray(data.selectedDays)
        ? data.selectedDays.map((selectedDay) => ({
            weekday: selectedDay.day,
            startTime: selectedDay.startHour,
            endTime: selectedDay.endHour,
          }))
        : data.selectedDays,
      senderId: data.senderId,
      workspaceId: workspace?.id,
    };
    await settingsService.save(setting, {
      apiToken: z.string().parse(searchParams.token),
    });
  };

  return (
    <main className="h-full">
      <AutoResponder
        onSave={saveSettings}
        activeSettings={{
          ...populateSettingsFormData(setting as SettingResponse, currentUserId),
        }}
        internalUsers={internalUsersWithClientAccessLimitedFalse}
      />
    </main>
  );
}
