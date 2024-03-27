'use client';

import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import TimezoneSelect, { ITimezone } from 'react-timezone-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorBoundary } from 'react-error-boundary';
import { Controller, FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { StylesConfig, components, DropdownIndicatorProps, GroupBase } from 'react-select';

import Days from './Days';
import Fieldset from './Fieldset';
import SelectField from './Select';
import { ChevronDown } from '@/icons';
import Typography from './Typography';
import WorkingHours from './WorkingHours';
import { SettingType } from '@prisma/client';
import {
  AUTO_RESPONSE_OPTIONS,
  DAYS,
  DAY_VALUE,
  DEFAULT_END_HOUR,
  DEFAULT_START_HOUR,
  HOUR,
  SelectedDay,
  SettingsData,
} from '@/constants';
import { InternalUser, InternalUsers } from '@/types/common';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';

const defaultSelectedDays: SelectedDay[] = [
  {
    day: DAYS.MONDAY,
    startHour: DEFAULT_START_HOUR,
    endHour: DEFAULT_END_HOUR,
  },
  {
    day: DAYS.TUESDAY,
    startHour: DEFAULT_START_HOUR,
    endHour: DEFAULT_END_HOUR,
  },
  {
    day: DAYS.WEDNESDAY,
    startHour: DEFAULT_START_HOUR,
    endHour: DEFAULT_END_HOUR,
  },
  {
    day: DAYS.THURSDAY,
    startHour: DEFAULT_START_HOUR,
    endHour: DEFAULT_END_HOUR,
  },
  {
    day: DAYS.FRIDAY,
    startHour: DEFAULT_START_HOUR,
    endHour: DEFAULT_END_HOUR,
  },
];

interface Props {
  onSave(data: SettingsData): Promise<void>;
  activeSettings: SettingsData;
  internalUsers: InternalUsers;
}

const DropdownIndicator = (props: DropdownIndicatorProps<ITimezone, false, GroupBase<ITimezone>>) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown />
    </components.DropdownIndicator>
  );
};

const colourStyles: StylesConfig<ITimezone, false, GroupBase<ITimezone>> = {
  // @ts-ignore
  control: (styles, state) => ({
    ...styles,
    backgroundColor: 'white',
    fontWeight: '400',
    fontSize: '0.875rem',
    lineHeight: '1.57',
    paddingInlineStart: '0.125rem',
    paddingInlineEnd: '0.375rem',
    borderColor: 'none',
    boxShadow: 'none',
    ':hover': {
      ...styles[':hover'],
      borderColor: state.isFocused ? '#C9CBCD' : '#C9CBCD',
    },
  }),

  // @ts-ignore
  menu: (styles) => ({
    ...styles,
    borderColor: '#DFE1E4',
    overflow: 'hidden',
  }),
  // @ts-ignore
  option: (styles, { isDisabled }) => {
    return {
      ...styles,
      backgroundColor: 'white',
      color: '#212B36',
      cursor: isDisabled ? 'not-allowed' : 'default',
      ':hover': {
        ...styles[':hover'],
        outlineColor: '#F8F9FB',
        background: '#F8F9FB',
      },

      ':focus': {
        ...styles[':focus'],
        outlineColor: 'black',
      },
      ':active': {
        ...styles[':active'],
        backgroundColor: '#F8F9FB',
      },
      fontSize: '0.875rem',
      lineHeight: '1.57',
      fontWeight: '400',
    };
  },
  // @ts-ignore
  input: (styles) => ({ ...styles, margin: '0px' }),
  // placeholder: (styles) => ({ ...styles, ...dot("#ccc") }),
  // singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
  // @ts-ignore
  clearIndicator: (styles) => ({ ...styles, display: 'none' }),
  // @ts-ignore
  indicatorSeparator: (styles) => ({ ...styles, display: 'none' }),
  dropdownIndicator: (styles) => ({ ...styles }),
};

const ValidationSchema = z.object({
  autoRespond: z.nativeEnum(SettingType),
  timezone: z.string().nullable().optional(),
  selectedDays: z
    .array(
      z.object({
        day: z.number(),
        startHour: z.nativeEnum(HOUR),
        endHour: z.nativeEnum(HOUR),
      }),
    )
    .min(1, 'Select at least one day')
    .max(7)
    .nullable(),
  response: z
    .string()
    .min(10, "Response can't be less than 10 characters long")
    .max(2000, "Response can't be more than 2000 characters long")
    .nullable(),
  senderId: z.string().uuid().nullable(),
});

const AutoResponder = ({ onSave, activeSettings, internalUsers }: Props) => {
  const defaultFormValues = useRef(activeSettings);
  const [saving, setSaving] = useState(false);
  const [workingHoursErrors, setWorkingHoursErrors] = useState<Record<number, string>>({});
  const methods = useForm<SettingsData>({
    mode: 'onChange',
    defaultValues: defaultFormValues.current,
    resolver: zodResolver(ValidationSchema),
  });
  const {
    control,
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = methods;

  const selectedDays = useFieldArray({
    control: control,
    name: 'selectedDays',
  });
  const autoRespond = watch('autoRespond');

  useEffect(() => {
    if (isDirty) {
      if (autoRespond === SettingType.DISABLED) {
        setValue('selectedDays', null, {
          shouldValidate: true,
        });
        setValue('timezone', null, {
          shouldValidate: true,
        });
      }
      if (autoRespond === SettingType.ENABLED) {
        setValue('timezone', null, {
          shouldValidate: true,
        });
        setValue('selectedDays', null, {
          shouldValidate: true,
        });
      }
      if (autoRespond === SettingType.OUTSIDE_WORKING_HOURS) {
        setValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone, {
          shouldValidate: true,
        });
        setValue('selectedDays', defaultSelectedDays, {
          shouldValidate: true,
        });
      }
    }
  }, [autoRespond]);

  const toggleSelectedDay = (day: DAY_VALUE) => {
    const selectedDayIndex = selectedDays.fields.findIndex((selectedDay) => selectedDay.day === day);

    if (selectedDayIndex >= 0) {
      selectedDays.remove(selectedDayIndex);
      setWorkingHoursErrors((existingErrors) => {
        delete existingErrors[day];

        return existingErrors;
      });
      return;
    }

    selectedDays.append({
      day,
      startHour: DEFAULT_START_HOUR,
      endHour: DEFAULT_END_HOUR,
    });
  };

  const validateWorkingHours = (selectedDays: SelectedDay[]) => {
    let newErrors = { ...workingHoursErrors };
    selectedDays.forEach((selectedDay) => {
      const { startHour, endHour } = selectedDay;

      if (endHour <= startHour) {
        newErrors = {
          ...newErrors,
          [selectedDay.day]: 'End time should be after start time',
        };
      } else {
        delete newErrors[selectedDay.day];
      }

      setWorkingHoursErrors(newErrors);
    });
    return Object.keys(newErrors).length < 1;
  };

  const onSubmit: SubmitHandler<SettingsData> = async (data) => {
    const isValidWorkingHours = validateWorkingHours(data.selectedDays || []);

    if (!isValidWorkingHours) {
      return;
    }
    setSaving(true);
    await onSave(data);
    setSaving(false);
    reset(data);
    setWorkingHoursErrors({});
    defaultFormValues.current = data;
  };

  const onReset = () => {
    reset(defaultFormValues.current);
    setWorkingHoursErrors({});
  };

  const checkFormErrors = () => {
    if (autoRespond === SettingType.ENABLED) {
      delete errors.selectedDays;
    }
    return !!Object.keys(errors).length;
  };

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
          <div className="w-full flex-1 overflow-y-scroll px-6 py-16">
            <div className="w-full max-w-[880px] mx-auto">
              <Fieldset
                title="Auto-responder configuration"
                info="Set up an automatic response to incoming messages in the Messages App. If clients send you several messages, auto-response will be sent at most once every hour (per message channel)."
              >
                <Typography text="Enable auto response" variant="label" className="mb-1.5 text-text" />
                <Controller
                  name="autoRespond"
                  render={({ field: { onChange, value } }) => (
                    <SelectField<SettingType>
                      value={value}
                      options={AUTO_RESPONSE_OPTIONS}
                      onValueChange={(value: string) => {
                        onChange(value);
                      }}
                    />
                  )}
                />
              </Fieldset>
              {autoRespond === SettingType.OUTSIDE_WORKING_HOURS && (
                <Fieldset title="Working hours" info="Your automated response will send outside of these hours">
                  <div>
                    <Typography text="Timezone" variant="label" className="mb-1.5" />
                    <Controller
                      name="timezone"
                      render={({ field: { onChange, value } }) => (
                        <TimezoneSelect
                          value={value || ''}
                          components={{
                            DropdownIndicator,
                          }}
                          onChange={(selectedTimeZone) => {
                            if (typeof selectedTimeZone !== 'string') {
                              onChange(selectedTimeZone.value);
                            }
                          }}
                          styles={colourStyles}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-wrap gap-y-2 items-center justify-between py-6 my-6 border-y border-gray-300">
                    <Typography text="Select days" variant="label" />
                    <div>
                      <Days selectedDays={selectedDays.fields} onDayClick={toggleSelectedDay} />
                      {errors.selectedDays && (
                        <p className="text-right text-red-500 text-xs mt-1">{errors.selectedDays.message}</p>
                      )}
                    </div>
                  </div>
                  {getValues().selectedDays && (
                    <WorkingHours selectedDays={selectedDays.fields} errors={workingHoursErrors} />
                  )}
                </Fieldset>
              )}
              {autoRespond !== SettingType.DISABLED && (
                <Fieldset title="Response message" info="Customize the automated response message">
                  <Typography text="Response" variant="label" className="mb-1.5" />
                  <div className="mb-8">
                    <textarea
                      placeholder="Your automated response"
                      className={`block w-full p-3 mb-1 text-[14px] font-normal rounded-md bg-transparent border hover:border-border-hover focus:shadow-none focus:outline-none ${
                        errors.response ? 'border-red-500' : ' border-border'
                      }`}
                      {...register('response')}
                    />
                    {errors.response && <p className="text-red-500 text-xs">{errors.response.message}</p>}
                  </div>
                  <Typography text="Sent by" variant="label" className="mb-1.5 mt-6" />
                  <Controller
                    name="senderId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        fullWidth
                        labelId="internal-users-select-label"
                        id="internal-users-select"
                        value={value}
                        label=""
                        onChange={(e: SelectChangeEvent) => {
                          onChange(e.target.value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-input': {
                            padding: '6px 12px',
                          },
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgb(201 203 205)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#C9CBCD',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#C9CBCD',
                          },
                        }}
                      >
                        {internalUsers.data?.map((user: InternalUser) => {
                          return <MenuItem key={user.id} value={user.id}>{`${user.givenName} ${user.familyName}`}</MenuItem>;
                        })}
                      </Select>
                    )}
                  />
                </Fieldset>
              )}
            </div>
          </div>
          {isDirty && (
            <div className="flex items-center justify-end gap-3 py-[14px] px-[20px] border-t border-gray-300">
              <button
                className="h-8 py-1 px-3 rounded-md min-w-[70px] bg-white border border-gray-300 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                onClick={onReset}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={checkFormErrors()}
                className="h-8 py-1 px-3 bg-slate-800 rounded-md min-w-[70px] text-white hover:bg-slate-900 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </form>
      </FormProvider>
    </ErrorBoundary>
  );
};

export default AutoResponder;
