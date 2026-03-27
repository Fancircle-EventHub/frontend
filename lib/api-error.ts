type UnknownError = {
  data?: {
    message?: string;
    data?: Record<string, string[] | string>;
  };
  message?: string;
};

export function extractApiErrorMessage(error: unknown): string {
  const e = error as UnknownError;
  return e?.data?.message ?? e?.message ?? "Something went wrong.";
}

export function extractFieldError(error: unknown, field: string): string | null {
  const e = error as UnknownError;
  const messages = e?.data?.data?.[field];
  if (!messages) return null;
  if (Array.isArray(messages)) return messages[0] ?? null;
  return messages;
}

export function extractApiErrorCode(error: unknown): string | null {
  return extractFieldError(error, "_code");
}
