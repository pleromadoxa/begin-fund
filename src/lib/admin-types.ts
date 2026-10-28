import type { ApplicationStatus } from "@/lib/types";

/** One application as shown in the committee panel. */
export interface AdminRow {
  id: string;
  reference: string;
  status: ApplicationStatus;
  tier: 1 | 2 | 3 | null;
  businessName: string;
  applicantName: string;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string | null;
  user: { name: string; email: string; phone: string; business: string } | null;
}
