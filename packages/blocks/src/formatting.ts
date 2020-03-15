// https://api.slack.com/reference/surfaces/formatting#date-formatting

export const DateString = (
  timestamp: number,
  format: string,
  fallback: string,
): string => `<!date^${timestamp}^${format}|${fallback}>`;

export const User = (id: string): string => `<@${id}>`;
