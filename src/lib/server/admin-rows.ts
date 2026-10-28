import { getStore } from "@/lib/server/store";
import type { AdminRow } from "@/lib/admin-types";

/** Loads every application (with its applicant) for the committee panel. */
export async function getAdminRows(): Promise<AdminRow[]> {
  const store = getStore();
  const apps = await store.listApplications();
  const users = await Promise.all(apps.map((a) => store.findUserById(a.userId)));
  const byId = new Map(users.filter(Boolean).map((u) => [u!.id, u!]));

  return apps.map((app) => ({
    id: app.id,
    reference: app.reference,
    status: app.status,
    tier: app.tier,
    businessName: app.businessName,
    applicantName:
      (typeof app.data.fullName === "string" && app.data.fullName) ||
      byId.get(app.userId)?.fullName ||
      "—",
    amount: app.amountRequested,
    createdAt: app.submittedAt ?? app.updatedAt,
    updatedAt: app.updatedAt,
    reviewNote: app.reviewNote,
    user: (() => {
      const u = byId.get(app.userId);
      return u
        ? {
            name: u.fullName,
            email: u.email,
            phone: u.phone,
            business: u.businessName,
          }
        : null;
    })(),
  }));
}
