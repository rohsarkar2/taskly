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

/**
 * The organization block the employee endpoints return.
 *
 * `register` and `initialize` send only the identity fields; `GET /organization`
 * adds the rest, so everything past `timezone` is optional and stays undefined
 * until that call lands.
 */
export type OrganizationSummaryModel = {
  id: string;
  name: string;
  uniqueOrganizationId: string;
  logo?: string;
  timezone?: string;
  industry?: string;
  website?: string;
  employeeCount?: number;
  workingDays?: string[];
  workingHours?: Record<string, unknown>;
  workflowSettings?: Record<string, unknown>;
};
