import axios from 'axios';

interface ApiErrorBody {
  message?: string | string[];
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.status;
  }

  return undefined;
}
