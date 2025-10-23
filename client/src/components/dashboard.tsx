import { TrendingUp, Briefcase, Home, Factory } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCounter } from "@/hooks/use-counter";
import { economicMetrics } from "@/lib/data";

const iconMap = {
  "chart-line": TrendingUp,
  briefcase: Briefcase,
  home: Home,
  industry: Factory,
};

const colorMap = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
};

export default function Dashboard() {
  return (
    <section id="analysis" className="py-16 bg-muted" data-testid="dashboard-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Economic Data Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time economic indicators and trends for the Texas economy.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(economicMetrics).map(([key, metric], index) => {
            const Icon = iconMap[metric.icon as keyof typeof iconMap];
            const colors = ["primary", "secondary", "accent", "primary"];
            const colorClass = colorMap[colors[index] as keyof typeof colorMap];

            return (
              <MetricCard
                key={key}
                metric={metric}
                Icon={Icon}
                colorClass={colorClass}
                testId={`metric-${key}`}
              />
            );
          })}
        </div>

        {/* Chart Visualization */}
        <Card className="shadow-lg" data-testid="chart-visualization">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-card-foreground mb-6">
              Texas Economic Performance Trends
            </h3>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"
              alt="Economic performance charts and data visualization"
              className="w-full h-80 object-cover rounded-lg"
              data-testid="chart-image"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

interface MetricCardProps {
  metric: {
    value: number;
    unit: string;
    change: string;
    label: string;
  };
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  testId: string;
}

function MetricCard({ metric, Icon, colorClass, testId }: MetricCardProps) {
  const { count, ref } = useCounter(metric.value, 2000, 0, metric.unit === "%" ? 1 : 1);

  return (
    <Card className="text-center shadow-lg" data-testid={testId}>
      <CardContent className="p-6">
        <div
          className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className="text-2xl" />
        </div>
        <h3
          ref={ref}
          className="text-2xl font-bold text-card-foreground mb-2"
          data-testid={`value-${testId}`}
        >
          {count}
          {metric.unit}
        </h3>
        <p className="text-muted-foreground" data-testid={`label-${testId}`}>
          {metric.label}
        </p>
        <span className="text-accent text-sm font-semibold" data-testid={`change-${testId}`}>
          {metric.change}
        </span>
      </CardContent>
    </Card>
  );
}
