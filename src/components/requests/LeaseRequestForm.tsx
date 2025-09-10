import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { CalendarIcon, Building, Users, FileText, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { sampleProperties } from '@/lib/sampleData';
import { useToast } from '@/hooks/use-toast';

const leaseRequestSchema = z.object({
  propertyId: z.string().min(1, 'Property selection is required'),
  tenantName: z.string().min(2, 'Tenant name must be at least 2 characters'),
  tenantABN: z.string().regex(/^\d{2}\s\d{3}\s\d{3}\s\d{3}$/, 'ABN must be in format: XX XXX XXX XXX').optional(),
  tenantACN: z.string().regex(/^\d{3}\s\d{3}\s\d{3}$/, 'ACN must be in format: XXX XXX XXX').optional(),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  leaseTerm: z.number().min(1, 'Lease term must be at least 1 month'),
  commencementDate: z.date({
    required_error: 'Commencement date is required',
  }),
  rentAmount: z.number().min(1, 'Rent amount must be greater than 0'),
  securityDeposit: z.number().min(0, 'Security deposit must be 0 or greater'),
  specialConditions: z.string().optional(),
});

type LeaseRequestForm = z.infer<typeof leaseRequestSchema>;

interface LeaseRequestFormProps {
  onSubmit: (data: LeaseRequestForm & { documents: any[] }) => void;
  onCancel: () => void;
}

export const LeaseRequestForm = ({ onSubmit, onCancel }: LeaseRequestFormProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [commencementDate, setCommencementDate] = useState<Date>();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LeaseRequestForm>({
    resolver: zodResolver(leaseRequestSchema),
  });

  const propertyId = watch('propertyId');
  const selectedProperty = sampleProperties.find(p => p.id === propertyId);

  const handleFormSubmit = async (data: LeaseRequestForm) => {
    if (!commencementDate) {
      toast({
        title: "Error",
        description: "Please select a commencement date",
        variant: "destructive",
      });
      return;
    }

    if (documents.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      ...data,
      commencementDate,
      documents,
    };

    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: "Lease request submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit lease request",
        variant: "destructive",
      });
    }
  };

  const formatABN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const match = numbers.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,3})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    return value;
  };

  const formatACN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,3})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property *</Label>
            <Select onValueChange={(value) => setValue('propertyId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {sampleProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{property.address}</span>
                      <span className="text-sm text-muted-foreground">
                        {property.unitNumber} • {property.propertyType} • {property.availableArea}m²
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyId && (
              <p className="text-sm text-destructive">{errors.propertyId.message}</p>
            )}
          </div>

          {selectedProperty && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Selected Property Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Unit:</span> {selectedProperty.unitNumber}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span> {selectedProperty.propertyType}
                </div>
                <div>
                  <span className="text-muted-foreground">Usage:</span> {selectedProperty.usageType}
                </div>
                <div>
                  <span className="text-muted-foreground">Area:</span> {selectedProperty.availableArea}m²
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Tenant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Tenant Name *</Label>
              <Input
                id="tenantName"
                {...register('tenantName')}
                placeholder="e.g., Stellar Fashion Pty Ltd"
              />
              {errors.tenantName && (
                <p className="text-sm text-destructive">{errors.tenantName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="contact@example.com"
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantABN">ABN (Optional)</Label>
              <Input
                id="tenantABN"
                {...register('tenantABN')}
                placeholder="12 345 678 901"
                onChange={(e) => {
                  const formatted = formatABN(e.target.value);
                  e.target.value = formatted;
                  setValue('tenantABN', formatted);
                }}
              />
              {errors.tenantABN && (
                <p className="text-sm text-destructive">{errors.tenantABN.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantACN">ACN (Optional)</Label>
              <Input
                id="tenantACN"
                {...register('tenantACN')}
                placeholder="123 456 789"
                onChange={(e) => {
                  const formatted = formatACN(e.target.value);
                  e.target.value = formatted;
                  setValue('tenantACN', formatted);
                }}
              />
              {errors.tenantACN && (
                <p className="text-sm text-destructive">{errors.tenantACN.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="+61 2 1234 5678"
              />
              {errors.contactPhone && (
                <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Lease Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leaseTerm">Lease Term (months) *</Label>
              <Input
                id="leaseTerm"
                type="number"
                {...register('leaseTerm', { valueAsNumber: true })}
                placeholder="36"
              />
              {errors.leaseTerm && (
                <p className="text-sm text-destructive">{errors.leaseTerm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Commencement Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !commencementDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {commencementDate ? format(commencementDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={commencementDate}
                    onSelect={setCommencementDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent (AUD) *</Label>
              <Input
                id="rentAmount"
                type="number"
                {...register('rentAmount', { valueAsNumber: true })}
                placeholder="15000"
              />
              {errors.rentAmount && (
                <p className="text-sm text-destructive">{errors.rentAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit (AUD) *</Label>
              <Input
                id="securityDeposit"
                type="number"
                {...register('securityDeposit', { valueAsNumber: true })}
                placeholder="45000"
              />
              {errors.securityDeposit && (
                <p className="text-sm text-destructive">{errors.securityDeposit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialConditions">Special Conditions</Label>
            <Textarea
              id="specialConditions"
              {...register('specialConditions')}
              placeholder="Enter any special lease conditions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Supporting Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload onDocumentsChange={setDocuments} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Lease Request'}
        </Button>
      </div>
    </form>
  );
};