import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {subtitle ? <p className="mt-1 text-grey">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: React.ReactNode; tone?: "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "text-navy";
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className={`font-display mt-1 text-2xl font-extrabold ${color}`}>{value}</div>
      {hint ? <div className="mt-1 text-sm text-grey">{hint}</div> : null}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "good" | "warn" | "bad"; children: React.ReactNode }) {
  const styles = {
    info: "border-light bg-pale text-navy",
    good: "border-green-200 bg-green-50 text-good",
    warn: "border-amber-200 bg-amber-50 text-warn",
    bad: "border-red-200 bg-red-50 text-bad",
  }[tone];
  const icon: IconName = tone === "good" ? "check" : tone === "info" ? "check" : "alert";
  return (
    <div role={tone === "bad" || tone === "warn" ? "alert" : "status"} className={`mb-4 flex gap-2 rounded-xl border p-3 text-sm font-semibold ${styles}`}>
      {tone !== "info" && <Icon name={icon} className="mt-0.5 shrink-0" size={18} />}
      <div>{children}</div>
    </div>
  );
}

export function Empty({ children, href, cta }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="card flex flex-col items-start gap-3 text-grey">
      <p>{children}</p>
      {href && cta ? (
        <Link href={href} className="btn-primary">
          <Icon name="plus" size={18} /> {cta}
        </Link>
      ) : null}
    </div>
  );
}

const STATUS: Record<string, string> = {
  draft: "bg-ground text-grey border border-line",
  sent: "bg-pale text-blue",
  paid: "bg-green-50 text-good",
  void: "bg-ground text-grey line-through",
  overdue: "bg-red-50 text-bad",
};

export function StatusBadge({ status, overdue }: { status: string; overdue?: boolean }) {
  const s = overdue ? "overdue" : status;
  return <span className={`badge ${STATUS[s] ?? STATUS.draft}`}>{s[0].toUpperCase() + s.slice(1)}</span>;
}

export function HoursMeter({ minutes, limit }: { minutes: number; limit: number }) {
  const pct = Math.min(100, (minutes / (limit * 60)) * 100);
  const over = minutes > limit * 60;
  const near = !over && minutes >= (limit - 4) * 60;
  const bar = over ? "bg-bad" : near ? "bg-[#d97706]" : "bg-blue";
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-ground"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={limit * 60}
      aria-valuenow={minutes}
      aria-label="Hours this week"
    >
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
