'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auditAPI } from '@/lib/api';
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

interface AuditPlan {
  id: number;
  title: string;
  description: string;
  year: number;
  status: string;
  created_at: string;
  creator_first_name: string;
  creator_last_name: string;
  approver_first_name: string;
  approver_last_name: string;
  approved_date: string;
}

interface AuditEngagement {
  id: number;
  engagement_number: string;
  title: string;
  objective: string;
  scope: string;
  status: string;
  planned_start_date: string;
  planned_end_date: string;
  budgeted_hours: number;
  actual_hours: number;
  lead_first_name: string;
  lead_last_name: string;
  plan_title: string;
  risk_level: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  planning: 'bg-yellow-100 text-yellow-800',
  fieldwork: 'bg-orange-100 text-orange-800',
  reporting: 'bg-indigo-100 text-indigo-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  draft: FileText,
  approved: CheckCircle,
  in_progress: Clock,
  completed: CheckCircle,
  planning: Calendar,
  fieldwork: Users,
  reporting: FileText,
  cancelled: AlertCircle
};

export default function AuditPlanningPage() {
  const [auditPlans, setAuditPlans] = useState<AuditPlan[]>([]);
  const [engagements, setEngagements] = useState<AuditEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansData, engagementsData] = await Promise.all([
          auditAPI.getPlans({ year: selectedYear }),
          auditAPI.getEngagements({ year: selectedYear })
        ]);
        
        setAuditPlans(plansData);
        setEngagements(engagementsData);
      } catch (error) {
        console.error('Failed to load audit planning data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Planning</h1>
            <p className="text-gray-600">
              Manage annual audit plans and engagements for risk-based auditing
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>

        {/* Audit Plans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Plans ({selectedYear})</CardTitle>
              <CardDescription>
                Annual audit plans for comprehensive risk coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No audit plans found for {selectedYear}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Plan
                    </Button>
                  </div>
                ) : (
                  auditPlans.map((plan) => {
                    const StatusIcon = statusIcons[plan.status] || FileText;
                    return (
                      <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>Created by: {plan.creator_first_name} {plan.creator_last_name}</span>
                              <span>•</span>
                              <span>{formatDate(plan.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[plan.status]}`}>
                              {plan.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Engagements Section */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Engagements</CardTitle>
              <CardDescription>
                Active and planned audit engagements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No engagements found for {selectedYear}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Engagement
                    </Button>
                  </div>
                ) : (
                  engagements.slice(0, 5).map((engagement) => {
                    const StatusIcon = statusIcons[engagement.status] || Clock;
                    return (
                      <div key={engagement.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{engagement.title}</h3>
                              <span className="text-sm text-gray-500">({engagement.engagement_number})</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{engagement.objective}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>Lead: {engagement.lead_first_name} {engagement.lead_last_name}</span>
                              {engagement.planned_start_date && (
                                <>
                                  <span>•</span>
                                  <span>{formatDate(engagement.planned_start_date)}</span>
                                </>
                              )}
                              {engagement.budgeted_hours && (
                                <>
                                  <span>•</span>
                                  <span>{engagement.budgeted_hours}h budgeted</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[engagement.status]}`}>
                              {engagement.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {engagements.length > 5 && (
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    View All {engagements.length} Engagements
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{auditPlans.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Engagements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagements.filter(e => ['planning', 'fieldwork', 'reporting'].includes(e.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagements.filter(e => e.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagements.reduce((sum, e) => sum + (e.budgeted_hours || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}