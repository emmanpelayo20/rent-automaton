import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { LeaseRequestForm } from '@/components/requests/LeaseRequestForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, FileText, User, Building, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createLeaseRequest } from '@/services/leaseRequestService';

interface NewLeaseRequestProps {
  onBack: () => void;
  onSubmitSuccess: (requestId: string) => void;
}

export const NewLeaseRequest = ({ onBack, onSubmitSuccess }: NewLeaseRequestProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      
      // Create new lease request record in DB
      const newRequest = await createLeaseRequest({
        ...data
      });
      
      //LANGGRAPH START
      //Generate a new request ID
      const document_data = data.documents.map((doc: any, index: number) => ({
              id: `doc_${newRequest.id}_${index}`,
              file: doc.file, 
              data: doc.base64,
              name: doc.name,
              type: doc.type,
              mimetype: doc.mimetype,
          }));
      
      const message = {id: newRequest.id, role: "human", content: "Extract the attached documents"};

      console.log('Submitting lease request to API...');

      const response = await fetch('http://localhost:2024/runs/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        assistant_id: 'agent',
        input: { 
          requestid: newRequest.id,
          messages: [message],
          documents: document_data,
        },
        stream_mode: ['values']
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      //console.log("response");
      //console.log(response);
      //const result = await response.json();

      //LANGGRAPH END
 
      toast({
        title: "Success!",
        description: `Lease request ${newRequest.id} has been submitted successfully`,
      });

      // Redirect to the new request details
      onSubmitSuccess(newRequest.id);
      
    } catch (error) {
      console.error('Error submitting lease request:', error);
      toast({
        title: "Error",
        description: "Failed to submit lease request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      icon: User,
      title: 'Tenant Information',
      description: 'Enter tenant details and contact information'
    },
    {
      icon: Building,
      title: 'Property Selection',
      description: 'Choose the property and unit for the lease'
    },
    {
      icon: DollarSign,
      title: 'Lease Terms',
      description: 'Define financial terms and lease duration'
    },
    {
      icon: FileText,
      title: 'Document Upload',
      description: 'Upload supporting documents for processing'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">New Lease Request</h1>
            <p className="text-muted-foreground">
              Create a new lease processing request with automated workflow
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Process Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Process Steps</CardTitle>
                <CardDescription>
                  Complete all sections to submit your request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-card rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="font-medium text-sm">Automated Processing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Once submitted, the Lease Agent will automatically process your request 
                    through all validation and setup steps.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Lease Request Details</CardTitle>
                <CardDescription>
                  Fill out the form below to initiate the automated lease setup process.
                  All required fields are marked with an asterisk (*).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaseRequestForm
                  onSubmit={handleSubmit}
                  onCancel={onBack}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-card border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">AI-Powered Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will automatically extract key information from your uploaded documents, 
                reducing manual data entry and processing time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-l-4 border-l-accent">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Automated Validation</h3>
              <p className="text-sm text-muted-foreground">
                Built-in ASIC validation and business partner checks ensure compliance 
                and reduce the risk of errors in lease setup.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-l-4 border-l-success">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Complete Audit Trail</h3>
              <p className="text-sm text-muted-foreground">
                Every action is logged with timestamps and confidence scores, 
                providing full transparency and accountability.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Integration Notes */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">System Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">SAP RE-FX Integration</h4>
                <p className="text-muted-foreground">
                  Automatic lease creation, business partner management, and property validation
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">ASIC Validation</h4>
                <p className="text-muted-foreground">
                  Real-time company verification against Australian Securities and Investments Commission records
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Document AI</h4>
                <p className="text-muted-foreground">
                  Intelligent extraction of lease terms, dates, and financial information from legal documents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};