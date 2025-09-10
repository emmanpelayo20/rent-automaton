// Sample data for Lease Agent demonstration

import { LeaseRequest, Property, BusinessPartner, WorkflowStatus, StepStatus, WORKFLOW_STEPS } from './types';

export const sampleProperties: Property[] = [
  {
    id: 'PROP001',
    address: '123 Collins Street, Melbourne VIC 3000',
    unitNumber: 'Shop 15',
    propertyType: 'retail',
    usageType: 'Fashion Retail',
    availableArea: 120,
    sapId: 'SAP-PROP-001',
    isAvailable: true
  },
  {
    id: 'PROP002',
    address: '456 George Street, Sydney NSW 2000',
    unitNumber: 'Level 3, Suite 301',
    propertyType: 'office',
    usageType: 'Professional Services',
    availableArea: 250,
    sapId: 'SAP-PROP-002',
    isAvailable: true
  },
  {
    id: 'PROP003',
    address: '789 Queen Street, Brisbane QLD 4000',
    unitNumber: 'Ground Floor',
    propertyType: 'retail',
    usageType: 'Food & Beverage',
    availableArea: 85,
    sapId: 'SAP-PROP-003',
    isAvailable: false
  }
];

export const sampleBusinessPartners: BusinessPartner[] = [
  {
    id: 'BP001',
    name: 'Stellar Fashion Pty Ltd',
    abn: '12 345 678 901',
    acn: '123 456 789',
    address: '45 Fashion Avenue, Melbourne VIC 3001',
    phone: '+61 3 9123 4567',
    email: 'accounts@stellarfashion.com.au',
    sapId: 'SAP-BP-001',
    verified: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'BP002',
    name: 'Metro Legal Services Pty Ltd',
    abn: '98 765 432 101',
    acn: '987 654 321',
    address: '22 Legal Way, Sydney NSW 2001',
    phone: '+61 2 8234 5678',
    email: 'admin@metrolegal.com.au',
    sapId: 'SAP-BP-002',
    verified: true,
    createdAt: new Date('2024-02-20')
  }
];

function createWorkflowSteps(currentStep: number, status: WorkflowStatus): any[] {
  return WORKFLOW_STEPS.map((step, index) => {
    let stepStatus: StepStatus = 'pending';
    let completedAt: Date | undefined;
    let startedAt: Date | undefined;
    
    if (index < currentStep - 1) {
      stepStatus = 'completed';
      startedAt = new Date(Date.now() - (12 - index) * 60 * 60 * 1000);
      completedAt = new Date(Date.now() - (11 - index) * 60 * 60 * 1000);
    } else if (index === currentStep - 1) {
      if (status === 'pending_review') {
        stepStatus = 'review_required';
      } else if (status === 'failed') {
        stepStatus = 'failed';
      } else {
        stepStatus = 'processing';
      }
      startedAt = new Date(Date.now() - 30 * 60 * 1000);
    }
    
    return {
      ...step,
      status: stepStatus,
      startedAt,
      completedAt,
      confidenceScore: index < currentStep - 1 ? Math.random() * 0.3 + 0.7 : undefined,
      requiresReview: stepStatus === 'review_required'
    };
  });
}

export const sampleLeaseRequests: LeaseRequest[] = [
  {
    id: 'LR001',
    propertyId: 'PROP001',
    tenantName: 'Stellar Fashion Pty Ltd',
    tenantABN: '12 345 678 901',
    tenantACN: '123 456 789',
    propertyAddress: '123 Collins Street, Melbourne VIC 3000, Shop 15',
    leaseTerm: 60, // 5 years
    commencementDate: new Date('2024-03-01'),
    rentAmount: 15000,
    securityDeposit: 45000,
    status: 'validation_review',
    createdAt: new Date('2024-01-10T09:30:00'),
    updatedAt: new Date('2024-01-10T14:45:00'),
    requestorEmail: 'sarah.wilson@premiumproperties.com.au',
    documents: [
      {
        id: 'DOC001',
        name: 'Solicitor_Instructions_Stellar_Fashion.pdf',
        type: 'solicitor_instructions',
        url: '/documents/solicitor_instructions_stellar.pdf',
        uploadedAt: new Date('2024-01-10T09:32:00'),
        size: 2457600,
        confidenceScore: 0.65, // Low confidence - requires review
        extractedData: {
          tenantName: 'Stellar Fashion Pty Ltd',
          abn: '12 345 678 901',
          propertyAddress: '123 Collins Street, Melbourne',
          leaseTerm: 60,
          rentAmount: 15000,
          securityDeposit: 45000
        }
      },
      {
        id: 'DOC002',
        name: 'ASIC_Extract_Stellar_Fashion.pdf',
        type: 'asic_extract',
        url: '/documents/asic_extract_stellar.pdf',
        uploadedAt: new Date('2024-01-10T09:35:00'),
        size: 892160,
        confidenceScore: 0.92,
        extractedData: {
          tenantName: 'Stellar Fashion Pty Ltd',
          abn: '12 345 678 901',
          acn: '123 456 789'
        }
      }
    ],
    workflowSteps: createWorkflowSteps(3, 'validation_review'),
    auditTrail: [
      {
        id: 'AUDIT001',
        timestamp: new Date('2024-01-10T09:30:00'),
        action: 'Lease request initiated',
        performedBy: 'sarah.wilson@premiumproperties.com.au',
        details: 'New lease request submitted for Stellar Fashion Pty Ltd at Shop 15, 123 Collins Street',
        stepNumber: 1
      },
      {
        id: 'AUDIT002',
        timestamp: new Date('2024-01-10T09:35:00'),
        action: 'Document extraction completed',
        performedBy: 'system',
        details: 'AI extraction completed for 2 documents. Low confidence detected in solicitor instructions.',
        stepNumber: 2,
        confidenceScore: 0.65
      },
      {
        id: 'AUDIT003',
        timestamp: new Date('2024-01-10T14:45:00'),
        action: 'Routed for human review',
        performedBy: 'system',
        details: 'Low confidence extraction for rent amount and lease term requires Data Admin review',
        stepNumber: 3
      }
    ]
  },
  {
    id: 'LR002',
    propertyId: 'PROP002',
    tenantName: 'Metro Legal Services Pty Ltd',
    tenantABN: '98 765 432 101',
    tenantACN: '987 654 321',
    propertyAddress: '456 George Street, Sydney NSW 2000, Level 3, Suite 301',
    leaseTerm: 36, // 3 years
    commencementDate: new Date('2024-02-15'),
    rentAmount: 22000,
    securityDeposit: 66000,
    status: 'shell_creation',
    createdAt: new Date('2024-01-08T11:15:00'),
    updatedAt: new Date('2024-01-09T16:20:00'),
    requestorEmail: 'michael.chen@premiumproperties.com.au',
    documents: [
      {
        id: 'DOC003',
        name: 'Solicitor_Instructions_Metro_Legal.pdf',
        type: 'solicitor_instructions',
        url: '/documents/solicitor_instructions_metro.pdf',
        uploadedAt: new Date('2024-01-08T11:17:00'),
        size: 1834752,
        confidenceScore: 0.89,
        extractedData: {
          tenantName: 'Metro Legal Services Pty Ltd',
          abn: '98 765 432 101',
          propertyAddress: '456 George Street, Sydney NSW 2000',
          leaseTerm: 36,
          rentAmount: 22000,
          securityDeposit: 66000
        }
      },
      {
        id: 'DOC004',
        name: 'ASIC_Extract_Metro_Legal.pdf',
        type: 'asic_extract',
        url: '/documents/asic_extract_metro.pdf',
        uploadedAt: new Date('2024-01-08T11:20:00'),
        size: 756224,
        confidenceScore: 0.94
      }
    ],
    workflowSteps: createWorkflowSteps(7, 'shell_creation'),
    auditTrail: [
      {
        id: 'AUDIT004',
        timestamp: new Date('2024-01-08T11:15:00'),
        action: 'Lease request initiated',
        performedBy: 'michael.chen@premiumproperties.com.au',
        details: 'New lease request submitted for Metro Legal Services at Level 3, Suite 301',
        stepNumber: 1
      },
      {
        id: 'AUDIT005',
        timestamp: new Date('2024-01-08T11:25:00'),
        action: 'Document extraction completed',
        performedBy: 'system',
        details: 'AI extraction completed successfully with high confidence scores',
        stepNumber: 2,
        confidenceScore: 0.89
      },
      {
        id: 'AUDIT006',
        timestamp: new Date('2024-01-09T16:20:00'),
        action: 'Shell lease creation in progress',
        performedBy: 'system',
        details: 'Contract Management Bot initiated shell lease creation in SAP RE-FX',
        stepNumber: 7
      }
    ]
  },
  {
    id: 'LR003',
    propertyId: 'PROP001',
    tenantName: 'Brew & Bean Coffee Co',
    tenantABN: '55 111 222 333',
    propertyAddress: '123 Collins Street, Melbourne VIC 3000, Shop 12',
    leaseTerm: 24,
    commencementDate: new Date('2024-04-01'),
    rentAmount: 8500,
    securityDeposit: 25500,
    status: 'completed',
    createdAt: new Date('2024-01-05T14:20:00'),
    updatedAt: new Date('2024-01-07T10:15:00'),
    requestorEmail: 'sarah.wilson@premiumproperties.com.au',
    documents: [
      {
        id: 'DOC005',
        name: 'Solicitor_Instructions_Brew_Bean.pdf',
        type: 'solicitor_instructions',
        url: '/documents/solicitor_instructions_brew.pdf',
        uploadedAt: new Date('2024-01-05T14:22:00'),
        size: 1245696,
        confidenceScore: 0.91
      }
    ],
    workflowSteps: createWorkflowSteps(13, 'completed'),
    auditTrail: [
      {
        id: 'AUDIT007',
        timestamp: new Date('2024-01-07T10:15:00'),
        action: 'Lease activation completed',
        performedBy: 'system',
        details: 'Lease successfully activated in SAP. SAP Lease ID: SAP-LEASE-003',
        stepNumber: 12,
        slaBreached: false
      }
    ]
  }
];

export const getCurrentUserEmail = () => 'sarah.wilson@premiumproperties.com.au';

export const getRequestById = (id: string): LeaseRequest | undefined => {
  return sampleLeaseRequests.find(req => req.id === id);
};

export const getPropertyById = (id: string): Property | undefined => {
  return sampleProperties.find(prop => prop.id === id);
};