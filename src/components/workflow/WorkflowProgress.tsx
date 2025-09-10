import { WorkflowStep, StepStatus } from "@/lib/types";
import { CheckCircle, Clock, AlertCircle, XCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  currentStep?: number;
}

export const WorkflowProgress = ({ steps, currentStep }: WorkflowProgressProps) => {
  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'processing':
        return <PlayCircle className="h-6 w-6 text-status-processing animate-pulse" />;
      case 'review_required':
        return <AlertCircle className="h-6 w-6 text-warning" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-error" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return 'border-success bg-success/10';
      case 'processing':
        return 'border-status-processing bg-status-processing/10';
      case 'review_required':
        return 'border-warning bg-warning/10';
      case 'failed':
        return 'border-error bg-error/10';
      default:
        return 'border-muted-foreground/30 bg-muted/30';
    }
  };

  const getConnectorColor = (index: number) => {
    if (index >= steps.length - 1) return '';
    
    const currentStatus = steps[index].status;
    if (currentStatus === 'completed') {
      return 'bg-success';
    }
    return 'bg-muted-foreground/30';
  };

  return (
    <div className="relative">
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.step} className="relative flex items-start">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute left-6 top-12 h-16 w-0.5 transition-colors duration-500",
                  getConnectorColor(index)
                )}
              />
            )}
            
            {/* Step Icon and Content */}
            <div className="flex items-start space-x-4 relative z-10">
              {/* Step Icon */}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                getStatusColor(step.status)
              )}>
                {getStatusIcon(step.status)}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-lg font-semibold transition-colors",
                    step.status === 'completed' ? 'text-success' :
                    step.status === 'processing' ? 'text-status-processing' :
                    step.status === 'review_required' ? 'text-warning' :
                    step.status === 'failed' ? 'text-error' :
                    'text-muted-foreground'
                  )}>
                    {step.step}. {step.name}
                  </h3>
                  
                  {step.requiresReview && (
                    <span className="px-3 py-1 text-xs font-medium bg-warning/20 text-warning rounded-full">
                      Review Required
                    </span>
                  )}
                </div>
                
                <p className="text-muted-foreground mt-1 mb-2">{step.description}</p>
                
                {/* Step Details */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {step.startedAt && (
                    <span>Started: {step.startedAt.toLocaleTimeString()}</span>
                  )}
                  {step.completedAt && (
                    <span>Completed: {step.completedAt.toLocaleTimeString()}</span>
                  )}
                  {step.confidenceScore && (
                    <span className={cn(
                      "px-2 py-1 rounded",
                      step.confidenceScore >= 0.8 ? 'bg-success/20 text-success' :
                      step.confidenceScore >= 0.6 ? 'bg-warning/20 text-warning' :
                      'bg-error/20 text-error'
                    )}>
                      Confidence: {Math.round(step.confidenceScore * 100)}%
                    </span>
                  )}
                </div>
                
                {step.notes && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                    <strong>Notes:</strong> {step.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};