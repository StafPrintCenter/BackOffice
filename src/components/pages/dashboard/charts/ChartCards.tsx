import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartItem } from "@/lib/dashboard";

const CHART_COLORS = [
  "#3C82AB",
  "#E07856",
  "#5A9B6E",
  "#C89A3E",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#06B6D4",
  "#F59E0B",
  "#6366F1",
];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
};

export interface BarChartViewProps {
  data: DashboardChartItem[];
  categoryKey?: "name" | "type";
  layout?: "horizontal" | "vertical";
  fontSize?: number;
  categoryAxisWidth?: number;
}

export function BarChartView({
  data,
  categoryKey = "name",
  layout = "horizontal",
  fontSize = 11,
  categoryAxisWidth,
}: BarChartViewProps) {
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer>
      <BarChart data={data} layout={layout}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        {isVertical ? (
          <>
            <XAxis type="number" stroke="var(--muted-foreground)" fontSize={fontSize} />
            <YAxis
              type="category"
              dataKey={categoryKey}
              stroke="var(--muted-foreground)"
              fontSize={fontSize}
              width={categoryAxisWidth}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={categoryKey} stroke="var(--muted-foreground)" fontSize={fontSize} />
            <YAxis stroke="var(--muted-foreground)" fontSize={fontSize} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface BarChartCardProps extends BarChartViewProps {
  title: string;
}

export function BarChartCard({ title, ...chartProps }: BarChartCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-elegant">
      <div className="font-display text-lg font-semibold">{title}</div>
      <div className="mt-4 h-64">
        <BarChartView {...chartProps} />
      </div>
    </div>
  );
}

interface PieChartCardProps {
  title: string;
  data: DashboardChartItem[];
}

export function PieChartCard({ title, data }: PieChartCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-elegant">
      <div className="font-display text-lg font-semibold">{title}</div>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={35} outerRadius={70}>
              {data.map((_, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
