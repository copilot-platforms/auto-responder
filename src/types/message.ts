import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  object: z.string(),
  senderId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  channelId: z.string(),
  isAttachmentIncluded: z.boolean(),
  text: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const SendMessageRequestSchema = z.object({
  text: z.string(),
  channelId: z.string(),
  senderId: z.string().uuid(),
});
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendMessageErrorResponseSchema = z.object({
  code: z.string(),
  type: z.string(),
  message: z.string(),
  error: z.object({}),
});
export type SendMessageErrorResponse = z.infer<typeof SendMessageErrorResponseSchema>;
