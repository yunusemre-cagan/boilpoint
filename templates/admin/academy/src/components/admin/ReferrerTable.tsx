"use client";

interface ReferrerData {
  referrer: string;
  count: number;
}

interface ReferrerTableProps {
  data: ReferrerData[];
}

function formatReferrer(referrer: string): string {
  if (!referrer || referrer === "direct") return "Doğrudan Ziyaret (Direct)";
  try {
    const url = new URL(referrer);
    return url.hostname.replace("www.", "");
  } catch {
    return referrer;
  }
}

export function ReferrerTable({ data }: ReferrerTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-slate-400 py-6 text-center">
        Henüz kayıtlı trafik kaynağı verisi yok.
      </div>
    );
  }

  const totalViews = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-3.5">
      {data.map((item, index) => {
        const percentage = totalViews > 0 ? Math.round((item.count / totalViews) * 100) : 0;
        return (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-1.5 text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200 truncate flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{formatReferrer(item.referrer)}</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 shrink-0 ml-2 font-mono">
                {item.count}{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-normal">
                  (%{percentage})
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
