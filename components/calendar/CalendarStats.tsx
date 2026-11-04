import { BarChart3, Grid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface CalendarStatsData {
  total: number;
  checkingIn: number;
  checkingOut: number;
  occupancy: number;
  revenue: number;
}

function StatCard({ label, value, valueClassName = '', icon }: {
  label: string;
  value: string | number;
  valueClassName?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-xl sm:text-2xl font-bold ${valueClassName}`}>{value}</p>
          </div>
          {/* Two cards share a row on phones; the label needs the room more */}
          <div className="hidden sm:block shrink-0">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CircleIcon({ symbol, className }: { symbol: string; className: string }) {
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${className}`}>
      <span className="text-lg">{symbol}</span>
    </div>
  );
}

export default function CalendarStats({ stats }: { stats: CalendarStatsData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatCard label="Total Reservations" value={stats.total} icon={<BarChart3 className="h-8 w-8 text-blue-600" />} />
      <StatCard label="Checking In Today" value={stats.checkingIn} valueClassName="text-green-600"
        icon={<CircleIcon symbol="→" className="bg-green-100" />} />
      <StatCard label="Checking Out Today" value={stats.checkingOut} valueClassName="text-orange-600"
        icon={<CircleIcon symbol="←" className="bg-orange-100" />} />
      <StatCard label="Occupancy Rate" value={`${stats.occupancy}%`} valueClassName="text-purple-600"
        icon={<Grid className="h-8 w-8 text-purple-600" />} />
      <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} valueClassName="text-green-600"
        icon={<CircleIcon symbol="$" className="bg-green-100" />} />
    </div>
  );
}
