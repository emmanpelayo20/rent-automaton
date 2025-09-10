import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { LeaseRequestCard } from '@/components/dashboard/LeaseRequestCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, TrendingUp, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { sampleLeaseRequests } from '@/lib/sampleData';
import { WorkflowStatus } from '@/lib/types';

interface DashboardProps {
  onCreateNew: () => void;
  onViewRequest: (id: string) => void;
}

export const Dashboard = ({ onCreateNew, onViewRequest }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');

  const filteredRequests = sampleLeaseRequests.filter(request => {
    const matchesSearch = request.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: sampleLeaseRequests.length,
    completed: sampleLeaseRequests.filter(r => r.status === 'completed').length,
    pending: sampleLeaseRequests.filter(r => r.status === 'pending_review').length,
    processing: sampleLeaseRequests.filter(r => 
      !['completed', 'failed', 'pending_review'].includes(r.status)
    ).length,
  };

  const getStatusOptions = () => {
    const statuses = Array.from(new Set(sampleLeaseRequests.map(r => r.status)));
    return statuses.map(status => ({
      value: status,
      label: status.replace('_', ' ').toUpperCase()
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Lease Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage lease processing workflows
            </p>
          </div>
          <Button onClick={onCreateNew} className="bg-gradient-primary shadow-md hover:shadow-lg transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Lease Request
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completed / stats.total) * 100)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by tenant, property, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WorkflowStatus | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} of {stats.total} requests
            </span>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {statusFilter.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Lease Requests Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <LeaseRequestCard
                key={request.id}
                request={request}
                onViewDetails={onViewRequest}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No requests found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};