import { Header } from '@/components/layout/Header';
import { WorkflowProgress } from '@/components/workflow/WorkflowProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, FileText, User, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getRequestById, getPropertyById } from '@/lib/sampleData';
import { cn } from '@/lib/utils';

interface LeaseRequestDetailsProps {
  requestId: string;
  onBack: () => void;
}

export const LeaseRequestDetails = ({ requestId, onBack }: LeaseRequestDetailsProps) => {
  const request = getRequestById(requestId);
  const property = request ? getPropertyById(request.propertyId) : null;

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Request Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The lease request you're looking for doesn't exist.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      case 'pending_review':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{request.tenantName}</h1>
              <p className="text-muted-foreground">Request ID: {request.id}</p>
            </div>
          </div>
          <Badge className={cn("text-sm px-4 py-2", getStatusColor(request.status))}>
            {request.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Quick Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Request Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{request.propertyAddress}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Commencement</p>
                  <p className="font-medium">{format(request.commencementDate, 'dd MMM yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="font-medium">{formatCurrency(request.rentAmount)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Lease Term</p>
                  <p className="font-medium">{request.leaseTerm} months</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="workflow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkflowProgress steps={request.workflowSteps} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tenant Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Tenant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{request.tenantName}</p>
                  </div>
                  
                  {request.tenantABN && (
                    <div>
                      <p className="text-sm text-muted-foreground">ABN</p>
                      <p className="font-medium">{request.tenantABN}</p>
                    </div>
                  )}
                  
                  {request.tenantACN && (
                    <div>
                      <p className="text-sm text-muted-foreground">ACN</p>
                      <p className="font-medium">{request.tenantACN}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Requestor</p>
                    <p className="font-medium">{request.requestorEmail}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{request.propertyAddress}</p>
                  </div>
                  
                  {property && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium capitalize">{property.propertyType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Usage Type</p>
                        <p className="font-medium">{property.usageType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Available Area</p>
                        <p className="font-medium">{property.availableArea}m²</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium text-lg">{formatCurrency(request.rentAmount)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Security Deposit</p>
                    <p className="font-medium">{formatCurrency(request.securityDeposit)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Term</p>
                    <p className="font-medium">{request.leaseTerm} months</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Total Lease Value</p>
                    <p className="font-medium text-lg text-primary">
                      {formatCurrency(request.rentAmount * request.leaseTerm)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Request Submitted</p>
                    <p className="font-medium">{format(request.createdAt, 'PPP p')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{format(request.updatedAt, 'PPP p')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Commencement</p>
                    <p className="font-medium">{format(request.commencementDate, 'PPP')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Completion</p>
                    <p className="font-medium">
                      {format(new Date(request.commencementDate.getTime() + request.leaseTerm * 30 * 24 * 60 * 60 * 1000), 'PPP')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Documents ({request.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>{format(doc.uploadedAt, 'dd MMM yyyy, HH:mm')}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {doc.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          {doc.confidenceScore && (
                            <div className="mt-1">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  doc.confidenceScore >= 0.8 ? 'text-success border-success' :
                                  doc.confidenceScore >= 0.6 ? 'text-warning border-warning' :
                                  'text-error border-error'
                                )}
                              >
                                Confidence: {Math.round(doc.confidenceScore * 100)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.auditTrail.map((entry, index) => (
                    <div key={entry.id}>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          {index < request.auditTrail.length - 1 && (
                            <div className="w-0.5 h-16 bg-muted-foreground/30 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{entry.action}</p>
                            <span className="text-sm text-muted-foreground">
                              {format(entry.timestamp, 'dd MMM, HH:mm')}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{entry.details}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Performed by: {entry.performedBy}</span>
                            {entry.stepNumber && (
                              <>
                                <span>•</span>
                                <span>Step {entry.stepNumber}</span>
                              </>
                            )}
                            {entry.confidenceScore && (
                              <>
                                <span>•</span>
                                <span>Confidence: {Math.round(entry.confidenceScore * 100)}%</span>
                              </>
                            )}
                            {entry.slaBreached && (
                              <>
                                <span>•</span>
                                <Badge variant="destructive" className="text-xs">SLA Breached</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};