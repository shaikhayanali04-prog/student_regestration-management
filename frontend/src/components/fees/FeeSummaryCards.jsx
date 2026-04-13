import { AlertCircle, CircleDollarSign, Clock3, Wallet } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const cards = [
  {
    key: "total_collected",
    label: "Fees Collected",
    icon: CircleDollarSign,
    accent: "from-emerald-500/15 to-cyan-500/15",
  },
  {
    key: "pending_fees",
    label: "Pending Fees",
    icon: Wallet,
    accent: "from-amber-500/15 to-orange-500/15",
  },
  {
    key: "overdue_fees",
    label: "Overdue Fees",
    icon: AlertCircle,
    accent: "from-rose-500/15 to-red-500/15",
  },
  {
    key: "today_collection",
    label: "Today's Collection",
    icon: Clock3,
    accent: "from-primary/20 to-violet-500/20",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function FeeSummaryCards({ summary = {} }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className={`overflow-hidden rounded-[28px] border-border bg-gradient-to-br ${card.accent}`}
          >
            <CardContent className="flex items-start justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight text-foreground">
                  {formatCurrency(summary[card.key] || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
