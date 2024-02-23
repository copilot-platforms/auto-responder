import { z } from 'zod';

export const TokenSchema = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  internalUserId: z.string().optional(),
  workspaceId: z.string(),
});

export type Token = z.infer<typeof TokenSchema>;

export const MeResponseSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),
  portalName: z.string(),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

// Response schema for `/workspace` endpoint
export const WorkspaceResponseSchema = z.object({
  id: z.string(),
  industry: z.string().optional(),
  isCompaniesEnabled: z.boolean().optional(),
  isClientDirectSignUpEnabled: z.boolean().optional(),
  logOutUrl: z.string().optional(),
  brandName: z.string().optional(),
  squareIconUrl: z.string().optional(),
  fullLogoUrl: z.string().optional(),
  squareLoginImageUrl: z.string().optional(),
  socialSharingImageUrl: z.string().optional(),
  colorSidebarBackground: z.string().optional(),
  colorSidebarText: z.string().optional(),
  colorAccent: z.string().optional(),
  font: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
export type WorkspaceResponse = z.infer<typeof WorkspaceResponseSchema>;

export const ClientResponseSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),
  companyId: z.string(),
  customFields: z.record(z.string(), z.union([z.string(), z.array(z.string())])).nullable(),
});

export type ClientResponse = z.infer<typeof ClientResponseSchema>;

export const ClientsResponseSchema = z.object({
  data: z.array(ClientResponseSchema).nullable(),
});

export const InternalUserSchema = z.object({
  id: z.string(),
  object: z.string(),
  createdAt: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),
  role: z.string(),
  isClientAccessLimited: z.boolean(),
  companyAccessList: z.array(z.string()).nullable(),
});

export const InternalUsersResponseSchema = z.object({
  data: z.array(InternalUserSchema).nullable(),
});

export type InternalUser = z.infer<typeof InternalUserSchema>;
export type InternalUsers = z.infer<typeof InternalUsersResponseSchema>;

export const CompanyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconImageUrl: z.string(),
});
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>;
