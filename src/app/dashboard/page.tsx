import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";
import { getStore } from "@/lib/server/store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — B.E.G.I.N",
  description: "Track your B.E.G.I.N funding application.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard");

  const { submitted } = await searchParams;
  const application = await getStore().getApplicationByUser(user.id);

  return (
    <main className="min-h-[100svh] flex flex-col bg-cream">
      <Header light />
      <div className="flex-1 pt-[110px] pb-20">
        <DashboardClient
          user={{
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            businessName: user.businessName,
            createdAt: user.createdAt,
          }}
          application={application}
          justSubmitted={submitted === "1"}
        />
      </div>
      <Footer />
    </main>
  );
}
