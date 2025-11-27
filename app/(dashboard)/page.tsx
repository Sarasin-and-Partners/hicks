'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
  Plus,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  total: number;
  open: number;
  inReview: number;
  closed: number;
  recentCount: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all incidents to calculate stats
        const response = await fetch('/api/incidents?pageSize=1000');
        if (response.ok) {
          const data = await response.json();
          const incidents = data.data || [];

          // Calculate stats
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          const calculatedStats: DashboardStats = {
            total: incidents.length,
            open: incidents.filter((i: { currentStatus: string }) => i.currentStatus === 'open').length,
            inReview: incidents.filter((i: { currentStatus: string }) => i.currentStatus === 'in_review').length,
            closed: incidents.filter((i: { currentStatus: string }) => i.currentStatus === 'closed').length,
            recentCount: incidents.filter((i: { reportedAt: string }) => new Date(i.reportedAt) >= sevenDaysAgo).length,
          };

          setStats(calculatedStats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.displayName}</h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of the incident management system
          </p>
        </div>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="mr-2 h-4 w-4" />
            New Incident
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Incidents"
          value={stats?.total || 0}
          description="All recorded incidents"
          icon={<FileSearch className="h-5 w-5" />}
          href="/incidents"
        />
        <StatCard
          title="Open"
          value={stats?.open || 0}
          description="Awaiting review"
          icon={<AlertTriangle className="h-5 w-5 text-blue-600" />}
          href="/incidents?status=open"
          variant="blue"
        />
        <StatCard
          title="In Review"
          value={stats?.inReview || 0}
          description="Under investigation"
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          href="/incidents?status=in_review"
          variant="yellow"
        />
        <StatCard
          title="Closed"
          value={stats?.closed || 0}
          description="Resolved incidents"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          href="/incidents?status=closed"
          variant="green"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Incidents reported in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.recentCount || 0}</div>
            <p className="text-sm text-muted-foreground">
              new incidents this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/incidents/new">
                <Plus className="mr-2 h-4 w-4" />
                Report New Incident
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/incidents?status=open">
                <AlertTriangle className="mr-2 h-4 w-4" />
                View Open Incidents
              </Link>
            </Button>
            {(user?.role === 'hod' || user?.role === 'risk_office' || user?.role === 'admin') && (
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant?: 'default' | 'blue' | 'yellow' | 'green';
}

function StatCard({ title, value, description, icon, href, variant = 'default' }: StatCardProps) {
  const bgColors = {
    default: '',
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
  };

  return (
    <Link href={href}>
      <Card className={`transition-colors hover:bg-accent/50 ${bgColors[variant]}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
