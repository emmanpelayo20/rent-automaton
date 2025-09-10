import { LeaseRequest } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, DollarSign, FileText, User, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaseRequestCardProps {
  request: LeaseRequest;
  onViewDetails: (id: string) => void;
}

export const LeaseRequestCard = ({ request, onViewDetails }: LeaseRequestCardProps) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'initiated':
        return 'Initiated';
      case 'document_extraction':
        return 'Processing Documents';
      case 'validation_review':
        return 'Pending Review';
      case 'space_validation':
        return 'Validating Space';
      case 'bp_check':
        return 'Business Partner Check';
      case 'asic_validation':
        return 'ASIC Validation';
      case 'shell_creation':
        return 'Creating Lease';
      case 'deposit_invoice':
        return 'Processing Invoice';
      case 'abstract_verification':
        return 'Verifying Abstract';
      case 'clause_finalisation':
        return 'Finalizing Clauses';
      case 'activation':
        return 'Activating Lease';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'pending_review':
        return 'Requires Review';
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  const getProgress = () => {
    const completedSteps = request.workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / request.workflowSteps.length) * 100;
  };

  const hasLowConfidence = request.workflowSteps.some(step => 
    step.confidenceScore && step.confidenceScore < 0.7
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{request.tenantName}</h3>
              {hasLowConfidence && (
                <Badge variant="outline" className="text-warning border-warning">
                  Low Confidence
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{request.propertyAddress}</span>
            </div>
          </div>
          <Badge className={cn("text-xs", getStatusColor(request.status))}>
            {getStatusText(request.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Monthly Rent</p>
              <p className="font-medium">{formatCurrency(request.rentAmount)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Commencement</p>
              <p className="font-medium">{format(request.commencementDate, 'dd MMM yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Documents</p>
              <p className="font-medium">{request.documents.length} files</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Requestor</p>
              <p className="font-medium text-xs">{request.requestorEmail.split('@')[0]}</p>
            </div>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created {format(request.createdAt, 'dd MMM, HH:mm')}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(request.id)}
            className="h-8 px-2 text-primary hover:text-primary-dark"
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};