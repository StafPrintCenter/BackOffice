import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MousePointerClick, Globe, Smartphone, Copy } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AdminShell } from "@/layouts/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { shortLinksApi, shortLinkClicksApi } from "@/api/extra.api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/short-links/$id")({
  head: () => ({ meta: [{ title: "Lien court — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ShortLinkDetail,
});

const pieColors = ["#E07856", "#3C82AB", "#5A9B6E", "#C89A3E", "#8B5CF6"];

function ShortLinkDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: links } = useQuery({ queryKey: ["short-links"], queryFn: shortLinksApi.list });
  const { data: clicks } = useQuery({ queryKey: ["short-link-clicks"], queryFn: shortLinkClicksApi.list });
  const link = links?.find((l) => l.id === id);
  const linkClicks = (clicks ?? []).filter((c) => c.shortLinkId === id);

  const byDevice = Object.entries(linkClicks.reduce<Record<string, number>>((a, c) => { a[c.device] = (a[c.device] ?? 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));
  const byCountry = Object.entries(linkClicks.reduce<Record<string, number>>((a, c) => { a[c.country] = (a[c.country] ?? 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));
  const byBrowser = Object.entries(linkClicks.reduce<Record<string, number>>((a, c) => { a[c.browser] = (a[c.browser] ?? 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));

  const timeline = (() => {
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); map.set(d.toISOString().slice(0, 10), 0); }
    linkClicks.forEach((c) => { const k = c.clickedAt.slice(0, 10); if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1); });
    return Array.from(map.entries()).map(([day, value]) => ({ day: day.slice(5), value }));
  })();

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(`https://stf.pr/${link.alias}`);
    toast.success("Lien copié");
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/short-links" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
      </div>
      {!link ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">Lien introuvable.</div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Alias</div>
                <div className="font-display text-2xl font-bold">stf.pr/{link.alias}</div>
                <a href={link.longUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-muted-foreground hover:underline break-all">↳ {link.longUrl}</a>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Catégorie <b className="text-foreground">{link.category}</b></span>
                  <span>· Actif <b className="text-foreground">{link.isActive ? "Oui" : "Non"}</b></span>
                  <span>· Expire le <b className="text-foreground">{link.expiresAt.slice(0, 10)}</b></span>
                </div>
              </div>
              <Button onClick={copy}><Copy className="h-4 w-4 mr-1" /> Copier</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total clics" value={linkClicks.length} icon={<MousePointerClick className="h-5 w-5" />} />
            <StatCard label="Pays différents" value={byCountry.length} icon={<Globe className="h-5 w-5" />} />
            <StatCard label="Appareils" value={byDevice.length} icon={<Smartphone className="h-5 w-5" />} />
            <StatCard label="Navigateurs" value={byBrowser.length} icon={<Smartphone className="h-5 w-5" />} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 lg:col-span-2">
              <div className="font-display text-lg font-semibold">Clics sur 30 jours</div>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <LineChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-display text-lg font-semibold">Par appareil</div>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byDevice} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>{byDevice.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-display text-lg font-semibold">Par pays</div>
              <div className="mt-4 h-56">
                <ResponsiveContainer>
                  <BarChart data={byCountry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#3C82AB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-display text-lg font-semibold">Par navigateur</div>
              <div className="mt-4 h-56">
                <ResponsiveContainer>
                  <BarChart data={byBrowser}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#5A9B6E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-semibold mb-4">Historique des clics</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Pays</th><th className="px-3 py-2 text-left">Ville</th><th className="px-3 py-2 text-left">Device</th><th className="px-3 py-2 text-left">Navigateur</th><th className="px-3 py-2 text-left">Referer</th></tr>
                </thead>
                <tbody>
                  {linkClicks.slice(0, 20).map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2 text-xs">{new Date(c.clickedAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{c.country}</td><td className="px-3 py-2">{c.city}</td>
                      <td className="px-3 py-2">{c.device}</td><td className="px-3 py-2">{c.browser}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.referer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
