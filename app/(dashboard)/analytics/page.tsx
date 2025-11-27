'use client';

import { useState, useEffect } from 'react';
import { useUser, useHasRole } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { BarChart3, TableIcon, Download, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface AnalyticsData {
  byDepartment: { name: string; count: number }[];
  byCategory: { name: string; count: number }[];
  byStatus: { name: string; count: number }[];
  bySeverity: { name: string; count: number }[];
  byMonth: { name: string; count: number }[];
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const router = useRouter();
  const canAccessAnalytics = useHasRole(['hod', 'risk_office', 'admin']);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [groupBy, setGroupBy] = useState<'department' | 'category' | 'status' | 'severity'>('category');

  useEffect(() => {
    if (user && !canAccessAnalytics) {
      router.push('/');
    }
  }, [user, canAccessAnalytics, router]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch all incidents for analysis
      const response = await fetch('/api/incidents?pageSize=1000');
      if (response.ok) {
        const result = await response.json();
        const incidents = result.data || [];

        // Process data for different visualizations
        const byDepartment: Record<string, number> = {};
        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};
        const byMonth: Record<string, number> = {};

        incidents.forEach((incident: {
          department?: { name: string };
          category: string;
          currentStatus: string;
          severity: string;
          occurredAt: string;
        }) => {
          // By department
          const deptName = incident.department?.name || 'Unknown';
          byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;

          // By category
          const categoryLabels: Record<string, string> = {
            near_miss: 'Near Miss',
            behavioural_issue: 'Behavioural Issue',
            process_gap: 'Process Gap',
            other: 'Other',
          };
          const catName = categoryLabels[incident.category] || incident.category;
          byCategory[catName] = (byCategory[catName] || 0) + 1;

          // By status
          const statusLabels: Record<string, string> = {
            open: 'Open',
            in_review: 'In Review',
            closed: 'Closed',
          };
          const statusName = statusLabels[incident.currentStatus] || incident.currentStatus;
          byStatus[statusName] = (byStatus[statusName] || 0) + 1;

          // By severity
          const severityLabels: Record<string, string> = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            critical: 'Critical',
          };
          const sevName = severityLabels[incident.severity] || incident.severity;
          bySeverity[sevName] = (bySeverity[sevName] || 0) + 1;

          // By month
          const date = new Date(incident.occurredAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
        });

        setData({
          byDepartment: Object.entries(byDepartment).map(([name, count]) => ({ name, count })),
          byCategory: Object.entries(byCategory).map(([name, count]) => ({ name, count })),
          byStatus: Object.entries(byStatus).map(([name, count]) => ({ name, count })),
          bySeverity: Object.entries(bySeverity).map(([name, count]) => ({ name, count })),
          byMonth: Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, count]) => ({ name, count })),
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getChartData = () => {
    if (!data) return [];
    switch (groupBy) {
      case 'department':
        return data.byDepartment;
      case 'category':
        return data.byCategory;
      case 'status':
        return data.byStatus;
      case 'severity':
        return data.bySeverity;
      default:
        return [];
    }
  };

  const exportToCsv = () => {
    const chartData = getChartData();
    const csv = [
      ['Name', 'Count'],
      ...chartData.map((row) => [row.name, row.count.toString()]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-by-${groupBy}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!canAccessAnalytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Analyze incident trends and patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.byCategory.reduce((sum, item) => sum + item.count, 0) || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.byDepartment.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data?.byStatus.find((s) => s.name === 'Open')?.count || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical/High</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {(data?.bySeverity.find((s) => s.name === 'Critical')?.count || 0) +
                    (data?.bySeverity.find((s) => s.name === 'High')?.count || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Incident Distribution</CardTitle>
                  <CardDescription>
                    View incidents grouped by different dimensions
                  </CardDescription>
                </div>
                <Select
                  value={groupBy}
                  onValueChange={(value) =>
                    setGroupBy(value as typeof groupBy)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="department">By Department</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                    <SelectItem value="severity">By Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList>
                  <TabsTrigger value="chart">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Chart
                  </TabsTrigger>
                  <TabsTrigger value="table">
                    <TableIcon className="mr-2 h-4 w-4" />
                    Table
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="pt-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Bar Chart */}
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#3b82f6" name="Incidents" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {getChartData().map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="table" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getChartData().map((row) => {
                        const total = getChartData().reduce(
                          (sum, item) => sum + item.count,
                          0
                        );
                        const percentage =
                          total > 0 ? ((row.count / total) * 100).toFixed(1) : '0';
                        return (
                          <TableRow key={row.name}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell className="text-right">{row.count}</TableCell>
                            <TableCell className="text-right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Trend Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Over Time</CardTitle>
              <CardDescription>Monthly incident count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.byMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
