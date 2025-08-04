import { SelectOption } from '@/app/components/Select';
import { $Enums, SettingType } from '@prisma/client';

export enum AUTO_RESPONSE {
  ALWAYS_ON = 'alwaysOn',
  OUTSIDE_WORKING_HOURS = 'outsideWorkingHours',
  OFF = 'off',
}

export const AUTO_RESPONSE_TIME_THRESHOLD = 60;

export const AUTO_RESPONSE_OPTIONS: SelectOption<$Enums.SettingType>[] = [
  {
    value: $Enums.SettingType.OUTSIDE_WORKING_HOURS,
    label: 'Outside working hours',
  },
  { value: $Enums.SettingType.ENABLED, label: 'Always on' },
  { value: $Enums.SettingType.DISABLED, label: 'Off' },
] as const;

export const DAYS = {
  SUNDAY: 7,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export enum HOUR {
  '0:00-AM' = '00:00',
  '1:00-AM' = '01:00',
  '2:00-AM' = '02:00',
  '3:00-AM' = '03:00',
  '4:00-AM' = '04:00',
  '5:00-AM' = '05:00',
  '6:00-AM' = '06:00',
  '7:00-AM' = '07:00',
  '8:00-AM' = '08:00',
  '9:00-AM' = '09:00',
  '10:00-AM' = '10:00',
  '11:00-AM' = '11:00',
  '12:00-PM' = '12:00',
  '1:00-PM' = '13:00',
  '2:00-PM' = '14:00',
  '3:00-PM' = '15:00',
  '4:00-PM' = '16:00',
  '5:00-PM' = '17:00',
  '6:00-PM' = '18:00',
  '7:00-PM' = '19:00',
  '8:00-PM' = '20:00',
  '9:00-PM' = '21:00',
  '10:00-PM' = '22:00',
  '11:00-PM' = '23:00',
}

export const DEFAULT_START_HOUR = HOUR['9:00-AM'] as const;
export const DEFAULT_END_HOUR = HOUR['5:00-PM'] as const;

export const HOURS_SELECT_OPTIONS: SelectOption<HOUR>[] = Object.entries(HOUR).map(([key, value]) => ({
  label: key.replace('-', ' '),
  value: value,
}));

export type DAY_VALUE = (typeof DAYS)[keyof typeof DAYS];
export type DAY_KEY = keyof typeof DAYS;

export interface SelectedDay {
  day: DAY_VALUE;
  startHour: HOUR;
  endHour: HOUR;
}

export interface SettingsData {
  autoRespond: SettingType;
  timezone: string | null;
  selectedDays: SelectedDay[] | null;
  response: string | null;
  senderId: string;
}
