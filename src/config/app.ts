const appConfig = {
  copilotApiKey: process.env.COPILOT_API_KEY || '',
  webhookSigningSecret: process.env.WEBHOOK_SIGNING_SECRET || '',
  apiUrl: `${process.env.VERCEL_ENV === 'development' ? 'http://' : 'https://'}${process.env.VERCEL_URL}`,
  sentry: {
    DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  },
};

export default appConfig;
