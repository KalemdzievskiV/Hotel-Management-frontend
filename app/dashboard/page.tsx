'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="mt-1 text-gray-600">
            Here's what's happening with your hotel management today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Hotels"
            value="12"
            change="+2 this month"
            changeType="positive"
            icon="🏨"
          />
          <StatCard
            title="Total Rooms"
            value="248"
            change="+15 this month"
            changeType="positive"
            icon="🛏️"
          />
          <StatCard
            title="Active Reservations"
            value="156"
            change="+23 today"
            changeType="positive"
            icon="📅"
          />
          <StatCard
            title="Total Revenue"
            value="$45,230"
            change="+12.5% this month"
            changeType="positive"
            icon="💰"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              icon="➕"
              title="New Reservation"
              description="Create a new booking"
              href="/dashboard/reservations/new"
            />
            <QuickActionButton
              icon="🏨"
              title="Add Hotel"
              description="Register a new hotel"
              href="/dashboard/hotels/new"
            />
            <QuickActionButton
              icon="👥"
              title="Add Guest"
              description="Register a new guest"
              href="/dashboard/guests/new"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <ActivityItem
              icon="✅"
              title="New reservation confirmed"
              description="Room 205 at Grand Hotel"
              time="5 minutes ago"
            />
            <ActivityItem
              icon="🏨"
              title="New hotel added"
              description="Sunset Resort"
              time="1 hour ago"
            />
            <ActivityItem
              icon="💰"
              title="Payment received"
              description="$450 from John Doe"
              time="2 hours ago"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p
            className={`mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </a>
  );
}

// Activity Item Component
function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
