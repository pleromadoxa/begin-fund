import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";
import { getStore } from "@/lib/server/store";
import { Header } from "@/components/header";
import { ApplyWizard } from "@/components/apply-wizard";

export const metadata: Metadata = {
  title: "Apply for Funding — B.E.G.I.N",
  description: "Complete your Business Expansion and Growth Initiative application.",
};

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/apply");

  const application = await getStore().getApplicationByUser(user.id);

  return (
    <main className="min-h-[100svh] bg-cream">
      <Header forceDark={false} />
      <div className="pt-[110px] pb-24">
        <ApplyWizard
          user={{
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            businessName: user.businessName,
          }}
          application={application}
        />
      </div>
    </main>
  );
}
