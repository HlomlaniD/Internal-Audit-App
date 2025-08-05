'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardAPI } from '@/lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileBarChart, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
  Target
} from 'lucide-react';

interface DashboardData {
  audit_statistics: Array<{ status: string; count: number }>;
  risk_statistics: Array<{ risk_level: string; count: number }>;
  finding_statistics: Array<{ severity: string; status: string; count: number }>;
  recent_engagements: Array<{
    id: number;
    title: string;
    engagement_number: string;
    status: string;
    planned_start_date: string;
    planned_end_date: string;
    first_name: string;
    last_name: string;
  }>;
  overdue_actions: Array<{
    id: number;
    action_description: string;
    target_completion_date: string;
    finding_title: string;
    engagement_title: string;
  }>;
  metrics: {
    total_engagements: number;
    completed_engagements: number;
    completion_rate: number;
    year: number;
  };
}

interface MyTasksData {
  my_engagements: Array<{
    id: number;
    title: string;
    engagement_number: string;
    status: string;
    planned_start_date: string;
    planned_end_date: string;
  }>;
  my_action_plans: Array<{
    id: number;
    action_description: string;
    target_completion_date: string;
    status: string;
    finding_title: string;
    engagement_title: string;
  }>;
  pending_reviews: Array<{
    id: number;
    title: string;
    wp_reference: string;
    created_at: string;
    engagement_title: string;
    first_name: string;
    last_name: string;
  }>;
}

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  gray: '#6B7280'
};

const riskColors: Record<string, string> = {
  low: COLORS.green,
  medium: COLORS.yellow,
  high: COLORS.red,
  critical: COLORS.red
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [myTasksData, setMyTasksData] = useState<MyTasksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [overview, myTasks] = await Promise.all([
          dashboardAPI.getOverview(),
          dashboardAPI.getMyTasks()
        ]);
        
        setDashboardData(overview);
        setMyTasksData(myTasks);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to the Internal Audit Management System. Here&apos;s your overview for {dashboardData?.metrics.year}.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileBarChart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Engagements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.metrics.total_engagements || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.metrics.completed_engagements || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.metrics.completion_rate || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue Actions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.overdue_actions.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Status</CardTitle>
              <CardDescription>Current status of audit engagements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData?.audit_statistics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS.blue}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Level Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Distribution</CardTitle>
              <CardDescription>Risk levels across assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData?.risk_statistics || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(dashboardData?.risk_statistics || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={riskColors[entry.risk_level] || COLORS.gray} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Engagements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Engagements</CardTitle>
              <CardDescription>Latest audit activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recent_engagements.slice(0, 5).map((engagement) => (
                  <div key={engagement.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`h-3 w-3 rounded-full ${
                        engagement.status === 'completed' ? 'bg-green-500' :
                        engagement.status === 'fieldwork' ? 'bg-yellow-500' :
                        engagement.status === 'reporting' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {engagement.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {engagement.engagement_number} • Lead: {engagement.first_name} {engagement.last_name}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        engagement.status === 'completed' ? 'bg-green-100 text-green-800' :
                        engagement.status === 'fieldwork' ? 'bg-yellow-100 text-yellow-800' :
                        engagement.status === 'reporting' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {engagement.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Your pending items and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* My Engagements */}
                {myTasksData?.my_engagements.slice(0, 3).map((engagement) => (
                  <div key={`eng-${engagement.id}`} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <FileBarChart className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{engagement.title}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(engagement.planned_end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}

                {/* My Action Plans */}
                {myTasksData?.my_action_plans.slice(0, 2).map((action) => (
                  <div key={`action-${action.id}`} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Target className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{action.finding_title}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(action.target_completion_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}

                {/* Pending Reviews */}
                {myTasksData?.pending_reviews.slice(0, 2).map((review) => (
                  <div key={`review-${review.id}`} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{review.title}</p>
                      <p className="text-xs text-gray-500">From: {review.first_name} {review.last_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}