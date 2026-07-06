import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { useGetInvestmentProfitHistory } from "@workspace/api-client-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  cumulativeProfit: {
    label: "Cumulative Profit",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ProfitHistoryChart({ investmentId }: { investmentId: number }) {
  const { data: history, isLoading } = useGetInvestmentProfitHistory(investmentId);

  if (isLoading) {
    return <div className="h-48 rounded-lg bg-secondary/30 animate-pulse" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-48 rounded-lg bg-secondary/30 flex flex-col items-center justify-center text-center px-4">
        <TrendingUp size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No profit credited yet. Daily profit will appear here once accrued.</p>
      </div>
    );
  }

  const chartData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cumulativeProfit: h.cumulativeProfit,
    amount: h.amount,
  }));

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
        <TrendingUp size={12} className="text-primary" /> Cumulative profit accrued over time
      </p>
      <ChartContainer config={chartConfig} className="h-48 w-full aspect-auto">
        <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-cumulativeProfit)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-cumulativeProfit)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={56}
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  name === "cumulativeProfit" ? "Total Profit" : name,
                ]}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="cumulativeProfit"
            stroke="var(--color-cumulativeProfit)"
            fill="url(#profitGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
