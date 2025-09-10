// Lease Agent Types and Interfaces

export interface LeaseRequest {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantABN?: string;
  tenantACN?: string;
  propertyAddress: string;
  leaseTerm: number; // months
  commencementDate: Date;
  rentAmount: number;
  securityDeposit: number;
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  requestorEmail: string;
  documents: LeaseDocument[];
  workflowSteps: WorkflowStep[];
  auditTrail: AuditEntry[];
}

export interface LeaseDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  size: number;
  extractedData?: ExtractedData;
  confidenceScore?: number;
}

export type DocumentType = 
  | 'solicitor_instructions'
  | 'asic_extract'
  | 'lease_agreement'
  | 'property_plan'
  | 'other';

export interface ExtractedData {
  tenantName?: string;
  abn?: string;
  acn?: string;
  propertyAddress?: string;
  leaseTerm?: number;
  rentAmount?: number;
  securityDeposit?: number;
  specialConditions?: string[];
  keyDates?: { [key: string]: Date };
}

export type WorkflowStatus = 
  | 'initiated'
  | 'document_extraction'
  | 'validation_review'
  | 'space_validation'
  | 'bp_check'
  | 'asic_validation'
  | 'shell_creation'
  | 'deposit_invoice'
  | 'abstract_verification'
  | 'clause_finalisation'
  | 'activation'
  | 'completed'
  | 'failed'
  | 'pending_review';

export interface WorkflowStep {
  step: number;
  name: string;
  description: string;
  status: StepStatus;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
  notes?: string;
  confidenceScore?: number;
  requiresReview?: boolean;
}

export type StepStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'review_required';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  performedBy: string; // 'system' or user email
  details: string;
  stepNumber?: number;
  confidenceScore?: number;
  slaBreached?: boolean;
}

export interface BusinessPartner {
  id: string;
  name: string;
  abn?: string;
  acn?: string;
  address: string;
  phone?: string;
  email?: string;
  sapId?: string;
  verified: boolean;
  createdAt: Date;
}

export interface Property {
  id: string;
  address: string;
  unitNumber?: string;
  propertyType: 'retail' | 'office' | 'industrial' | 'mixed';
  usageType: string;
  availableArea: number;
  sapId: string;
  isAvailable: boolean;
}

// Workflow step definitions
export const WORKFLOW_STEPS: Omit<WorkflowStep, 'status' | 'startedAt' | 'completedAt'>[] = [
  {
    step: 1,
    name: 'Request Initiation',
    description: 'Initial lease request submitted with metadata and documents'
  },
  {
    step: 2,
    name: 'Document Extraction',
    description: 'AI extraction of key data fields from uploaded documents'
  },
  {
    step: 3,
    name: 'Validation & Exceptions',
    description: 'Human review of low-confidence extracted data'
  },
  {
    step: 4,
    name: 'Usage Type & Unit Check',
    description: 'Verification of space details and usage type in SAP RE-FX'
  },
  {
    step: 5,
    name: 'Business Partner Check',
    description: 'Identification or creation of tenant Business Partner in SAP'
  },
  {
    step: 6,
    name: 'ASIC Validation',
    description: 'Compliance check against ASIC records for tenant entity'
  },
  {
    step: 7,
    name: 'Shell Lease Creation',
    description: 'Creation of initial lease contract in SAP using validated inputs'
  },
  {
    step: 8,
    name: 'Deposit Invoice',
    description: 'Generation and issuance of lease deposit invoice'
  },
  {
    step: 9,
    name: 'Lease Abstract Verification',
    description: 'Comparison of SAP lease abstracts before and after data entry'
  },
  {
    step: 10,
    name: 'Clause Finalisation',
    description: 'Completion of specific lease clause entries'
  },
  {
    step: 11,
    name: 'Lease Activation',
    description: 'Setting the lease to active status in SAP'
  },
  {
    step: 12,
    name: 'Audit & Notification',
    description: 'Final logging, SLA tracking, and requestor notification'
  }
];