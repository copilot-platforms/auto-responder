export declare class CopilotAPIError {
  request: {
    errors: {
      '404': '404' | string;
    };
  };
}

export const matchesCopilotApiError = (err: unknown) => {
  return !!(err as any)?.request?.errors?.length;
};
