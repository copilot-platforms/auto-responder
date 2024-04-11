import { NextResponse } from 'next/server';
import { CopilotAPI } from '@/utils/copilotApiUtils';
import { WorkingHours } from '@/types/setting';
import { DayOfWeek, LocalTime, ZonedDateTime, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import { MeResponse, WorkspaceResponse } from '@/types/common';

export function errorHandler(message: string, status: number = 200) {
  return NextResponse.json(
    { message },
    {
      status,
    },
  );
}

export async function getWorkspace(apiToken: string): Promise<WorkspaceResponse> {
  const copilotClient = new CopilotAPI(apiToken);
  return await copilotClient.getWorkspace();
}

export async function getCurrentUser(apiToken: string): Promise<MeResponse | null> {
  const copilotClient = new CopilotAPI(apiToken);
  return await copilotClient.me();
}

export function isWithinWorkingHours(timezone: string, workingHours: WorkingHours) {
  const currentDateTime = ZonedDateTime.now(ZoneId.of(timezone));
  const currentDay = currentDateTime.dayOfWeek();
  const workingDay = workingHours.find((workingHour) => DayOfWeek.of(workingHour.weekday).equals(currentDay));

  if (!workingDay) {
    return false;
  }

  const currentTime = currentDateTime.toLocalTime();

  return (
    currentTime.isAfter(LocalTime.parse(workingDay.startTime)) && currentTime.isBefore(LocalTime.parse(workingDay.endTime))
  );
}
