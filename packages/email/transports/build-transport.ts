import type { TEmailTransportConfig } from '@documenso/lib/server-only/email/email-transport-config';
import { ResendTransport } from '@documenso/nodemailer-resend';
import type { Transporter } from 'nodemailer';
import { createTransport } from 'nodemailer';

import { MailChannelsTransport } from './mailchannels';

export const buildTransport = (config: TEmailTransportConfig): Transporter => {
  switch (config.type) {
    case 'MAILCHANNELS':
      return createTransport(
        MailChannelsTransport.makeTransport({
          apiKey: config.apiKey,
          endpoint: config.endpoint,
        }),
      );

    case 'RESEND':
      return createTransport(
        ResendTransport.makeTransport({
          apiKey: config.apiKey,
        }),
      );

    case 'SMTP_API':
      return createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        // Some hosts (e.g. Render) have no working IPv6 egress, which makes
        // connections to hosts that resolve to an AAAA record (e.g. Gmail)
        // fail with ENETUNREACH. Force IPv4 to avoid that.
        family: 4,
        auth: {
          user: config.apiKeyUser ?? 'apikey',
          pass: config.apiKey,
        },
      });

    case 'SMTP_AUTH':
      return createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        ignoreTLS: config.ignoreTLS,
        // See comment in the SMTP_API case above.
        family: 4,
        auth: config.username
          ? {
              user: config.username,
              pass: config.password ?? '',
            }
          : undefined,
        ...(config.service ? { service: config.service } : {}),
      });
  }
};
