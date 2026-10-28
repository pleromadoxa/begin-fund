import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/server/crypto";
import { getAdminRows } from "@/lib/server/admin-rows";
import AdminClient from "@/components/admin-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Committee — B.E.G.I.N" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("begin_admin")?.value;
  const isCommittee = !!token && verifySessionToken(token) === "admin";

  if (!isCommittee) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
        <p className="eyebrow">Restricted area</p>
        <h1 className="font-display mt-2 text-4xl leading-tight text-[#062b20]">
          Committee Panel
        </h1>
        <p className="mt-3 text-sm text-[#4a5d55]">
          Enter the committee passphrase to review and decide on applications.
        </p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Incorrect passphrase. Please try again.
          </p>
        )}
        <form action="/api/admin/login" method="POST" className="mt-8 space-y-4">
          <input
            type="password"
            name="password"
            required
            placeholder="Committee passphrase"
            className="w-full rounded-xl border border-[#d8d2c2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c9a54c] focus:ring-4 focus:ring-[#c9a54c]/15"
          />
          <button className="btn-primary w-full justify-center">Enter panel</button>
        </form>
      </main>
    );
  }

  let initialRows;
  try {
    initialRows = await getAdminRows();
  } catch {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-[#062b20]">The cellar is busy</h1>
        <p className="mt-3 text-sm text-[#4a5d55]">
          The database did not answer in time. Refresh this page in a few seconds.
        </p>
      </main>
    );
  }

  return <AdminClient initialRows={initialRows} />;
}
