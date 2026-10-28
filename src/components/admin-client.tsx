"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  LogOut,
  RefreshCw,
  SearchX,
  XCircle,
} from "lucide-react";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/types";
import type { AdminRow } from "@/lib/admin-types";

const DECISIONS: { status: ApplicationStatus; label: string; tone: string }[] = [
  { status: "under_review", label: "Start review", tone: "gold" },
  { status: "more_info_required", label: "Request info", tone: "blue" },
  { status: "approved", label: "Approve", tone: "green" },
  { status: "rejected", label: "Reject", tone: "red" },
];

const TONE_CLASSES: Record<string, string> = {
  green: "border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white",
  red: "border-red-500 text-red-600 hover:bg-red-500 hover:text-white",
  blue: "border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white",
  gold: "border-[#c9a54c] text-[#8a6d1f] hover:bg-[#c9a54c] hover:text-[#062b20]",
};

export default function AdminClient({ initialRows }: { initialRows: AdminRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminRow[]>(initialRows);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [error, setError] = useState("");
  // Inline confirmation: which row + decision is waiting for a final click
  const [pending, setPending] = useState<{ id: string; status: ApplicationStatus } | null>(
    null,
  );
  const [noteText, setNoteText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin", { cache: "no-store" });
    if (res.ok) {
      setRows(await res.json());
    } else if (res.status === 401) {
      // Session expired — re-run the server component to show the gate again.
      router.refresh();
    }
  }, [router]);

  async function submit(row: AdminRow, status: ApplicationStatus, note?: string) {
    setBusy(row.id);
    setError("");
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status, note }),
    });
    if (res.ok) {
      setPending(null);
      setNoteText("");
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Update failed");
    }
    setBusy(null);
  }

  function decide(row: AdminRow, status: ApplicationStatus) {
    const isPending = pending?.id === row.id && pending?.status === status;

    // "Request info" opens an inline note editor
    if (status === "more_info_required") {
      if (isPending) {
        if (!noteText.trim()) {
          setError("Please describe what the applicant needs to provide.");
          return;
        }
        void submit(row, status, noteText.trim());
      } else {
        setPending({ id: row.id, status });
        setNoteText(row.reviewNote || "");
        setError("");
      }
      return;
    }

    // Approve / Reject need one explicit confirmation click
    if (status === "approved" || status === "rejected") {
      if (isPending) {
        void submit(row, status);
      } else {
        setPending({ id: row.id, status });
        setError("");
      }
      return;
    }

    // Low-stakes: review starts immediately
    void submit(row, status);
  }

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ministry of Commerce — Review Committee</p>
          <h1 className="font-display mt-2 text-4xl text-[#062b20]">Committee Panel</h1>
          <p className="mt-2 text-sm text-[#4a5d55]">
            {rows.length} application{rows.length === 1 ? "" : "s"} received · every
            decision updates the applicant&apos;s dashboard timeline in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline px-3 py-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <form action="/api/admin/signout" method="POST">
            <button className="btn-outline px-3 py-2 text-xs">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...DECISIONS.map((d) => d.status)] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              filter === key
                ? "border-[#c9a54c] bg-[#c9a54c] text-[#062b20]"
                : "border-[#d8d2c2] bg-white text-[#4a5d55] hover:border-[#c9a54c]/60"
            }`}
          >
            {key === "all" ? "All" : STATUS_LABELS[key as ApplicationStatus]}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 space-y-4">
        {filtered.length === 0 && (
          <div className="card-ivory flex flex-col items-center gap-3 p-10 text-center">
            <SearchX className="h-8 w-8 text-[#c9a54c]" />
            <p className="text-sm text-[#4a5d55]">No applications in this view.</p>
          </div>
        )}
        <AnimatePresence>
          {filtered.map((row, i) => {
            const isPendingRow = pending?.id === row.id;
            const pendingDecision = DECISIONS.find(
              (d) => isPendingRow && d.status === pending?.status,
            );
            return (
              <motion.article
                key={row.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="card-ivory p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-[#c9a54c]" />
                      <h2 className="font-display text-xl text-[#062b20]">
                        {row.businessName}
                      </h2>
                      <span className="status-pill" data-status={row.status}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#4a5d55]">
                      {row.applicantName} ·{" "}
                      {row.tier ? `Tier ${row.tier}` : "Tier pending"} ·{" "}
                      {row.amount
                        ? `GHS ${row.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        : "Amount pending"}{" "}
                      · <span className="font-mono text-xs">{row.reference}</span>
                    </p>
                    {row.user && (
                      <p className="mt-1 text-xs text-[#7a8a82]">
                        {row.user.email} · {row.user.phone}
                      </p>
                    )}
                    {row.reviewNote && row.status === "more_info_required" && (
                      <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
                        Requested: {row.reviewNote}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DECISIONS.map((d) => {
                      const armed = isPendingRow && pending?.status === d.status;
                      return (
                        <button
                          key={d.status}
                          disabled={busy === row.id || row.status === d.status}
                          onClick={() => decide(row, d.status)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 ${TONE_CLASSES[d.tone]} ${armed ? "ring-2 ring-offset-1 ring-current" : ""}`}
                        >
                          {d.status === "approved" ? (
                            <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                          ) : d.status === "rejected" ? (
                            <XCircle className="mr-1 inline h-3.5 w-3.5" />
                          ) : d.status === "under_review" ? (
                            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                          ) : null}
                          {armed
                            ? d.status === "more_info_required"
                              ? "Send request ↓"
                              : `Confirm ${d.label.toLowerCase()}`
                            : d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isPendingRow && pendingDecision && (
                  <div className="mt-4 border-t border-[#e4dfd1] pt-4">
                    {pending.status === "more_info_required" ? (
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-[#062b20]">
                              What should {row.applicantName.split(" ")[0]} provide?
                            </label>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={3}
                              autoFocus
                              placeholder="e.g. Upload a clear scan of your Ghana Card and your last 3 months of sales records."
                              className="w-full rounded-xl border border-[#d8d2c2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c9a54c] focus:ring-4 focus:ring-[#c9a54c]/15"
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={busy === row.id}
                                onClick={() => submit(row, "more_info_required", noteText.trim())}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                Send to applicant
                              </button>
                              <button
                                onClick={() => setPending(null)}
                                className="rounded-lg border border-[#d8d2c2] px-4 py-2 text-xs font-semibold text-[#4a5d55] transition hover:border-[#4a5d55]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-sm text-[#4a5d55]">
                              {pending.status === "approved"
                                ? `Approve ${row.businessName}${row.tier ? ` for Tier ${row.tier}` : ""} funding? The applicant will see this on their dashboard.`
                                : `Mark ${row.businessName} as not successful? The applicant will see this on their dashboard.`}
                            </p>
                            <div className="flex gap-2">
                              <button
                                disabled={busy === row.id}
                                onClick={() => submit(row, pending.status)}
                                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50 ${
                                  pending.status === "approved"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                              >
                                {busy === row.id ? "Saving…" : "Yes, confirm"}
                              </button>
                              <button
                                onClick={() => setPending(null)}
                                className="rounded-lg border border-[#d8d2c2] px-4 py-2 text-xs font-semibold text-[#4a5d55] transition hover:border-[#4a5d55]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
}
