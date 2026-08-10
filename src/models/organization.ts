export type OrganizationModel = {
  id: string;
  name: string;
  uniqueOrganizationId: string;
  size: string;
  memberCount: number;
  activeProjectCount: number;
  adminName: string;
  adminEmail: string;
  createdAt: string; // ISO string format
};
