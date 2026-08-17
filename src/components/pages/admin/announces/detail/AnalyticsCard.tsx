import { useMemo } from "react";
import { Loader2, BarChart3, Eye, MousePointerClick, XCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { ANNOUNCEMENT_EVENT_LABELS, ANNOUNCEMENT_EVENT_BADGES } from "@/data/announcements";

interface AnalyticsData {
  views: number;
  clicks: number;
  closes: number;
  clickThroughRate: number;
  byDay: Array<{ day: string; event_type: "view" | "click" | "close"; total: number }>;
}

function formatDay(day: string) {
  return new Date(day).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}

export function AnnouncementAnalyticsCard({ analytics }: { analytics?: AnalyticsData }) {
  const chartData = useMemo(() => {
    if (!analytics?.byDay) return [];

    const daysMap = new Map<string, { date: string; view: number; click: number; close: number }>();

    analytics.byDay.forEach((row) => {
      const dateFormatted = formatDay(row.day);
      if (!daysMap.has(row.day)) {
        daysMap.set(row.day, { date: dateFormatted, view: 0, click: 0, close: 0 });
      }
      const current = daysMap.get(row.day)!;
      if (row.event_type === "view") current.view += row.total;
      else if (row.event_type === "click") current.click += row.total;
      else if (row.event_type === "close") current.close += row.total;
    });

    return Array.from(daysMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([, data]) => data);
  }, [analytics]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 font-display text-lg font-semibold">
        <BarChart3 className="h-5 w-5 text-primary" /> Analyses & Engagement
      </div>
      {analytics ? (
        <div className="space-y-6">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
              <Eye className="h-4 w-4 text-sky-600 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Vues</div>
                <div className="text-sm font-semibold">{analytics.views}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
              <MousePointerClick className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Clics</div>
                <div className="text-sm font-semibold">{analytics.clicks}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
              <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Fermetures</div>
                <div className="text-sm font-semibold">{analytics.closes}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Taux de clic</div>
                <div className="text-sm font-semibold">{analytics.clickThroughRate}%</div>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Évolution quotidienne des événements</div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="view" name="Vues" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="click" name="Clics" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="close" name="Fermetures" stroke="#6b7280" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
              Aucune donnée historique à afficher pour la période.
            </div>
          )}

          {analytics.byDay.length > 0 && (
            <div className="divide-y rounded-xl border">
              {analytics.byDay.map((row, i) => (
                <div key={`${row.day}-${row.event_type}-${i}`} className="flex items-center justify-between p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDay(row.day)}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ANNOUNCEMENT_EVENT_BADGES[row.event_type]}`}>
                      {ANNOUNCEMENT_EVENT_LABELS[row.event_type]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{row.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Chargement des analyses...
        </div>
      )}
    </div>
  );
}