/**
 * User-facing message from a failed API call: the API's own message when it sent one
 * (business-rule and validation errors), otherwise the given fallback.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === 'string' && data) return data;
  if (data && typeof data === 'object') {
    const { message, title } = data as { message?: unknown; title?: unknown };
    if (typeof message === 'string' && message) return message;
    if (typeof title === 'string' && title) return title;
  }
  return fallback;
}
