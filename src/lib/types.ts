export type Tier = 1 | 2 | 3;

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_info_required"
  | "approved"
  | "rejected";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  passwordHash: string;
  createdAt: string;
}

export type SafeUser = Omit<User, "passwordHash">;

export interface TimelineEvent {
  status: ApplicationStatus;
  at: string;
  note?: string;
}

export interface Application {
  id: string;
  userId: string;
  status: ApplicationStatus;
  tier: Tier | null;
  reference: string;
  amountRequested: number | null;
  loanPurpose: string;
  businessName: string;
  submittedAt: string | null;
  updatedAt: string;
  reviewNote: string | null;
  timeline: TimelineEvent[];
  data: Record<string, unknown>;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft in progress",
  submitted: "Application submitted",
  under_review: "Under review",
  more_info_required: "Additional information required",
  approved: "Approved",
  rejected: "Not successful",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: "#6b6a5f",
  submitted: "#147a58",
  under_review: "#c9a54c",
  more_info_required: "#b3711a",
  approved: "#1fa87a",
  rejected: "#9b3b2f",
};
