import { useState } from 'react';
import { Dashboard } from './Dashboard';
import { NewLeaseRequest } from './NewLeaseRequest';
import { LeaseRequestDetails } from './LeaseRequestDetails';

type AppView = 'dashboard' | 'new-request' | 'request-details';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  const handleCreateNew = () => {
    setCurrentView('new-request');
  };

  const handleViewRequest = (id: string) => {
    setSelectedRequestId(id);
    setCurrentView('request-details');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedRequestId('');
  };

  const handleSubmitSuccess = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('request-details');
  };

  switch (currentView) {
    case 'new-request':
      return (
        <NewLeaseRequest 
          onBack={handleBack}
          onSubmitSuccess={handleSubmitSuccess}
        />
      );
    
    case 'request-details':
      return (
        <LeaseRequestDetails 
          requestId={selectedRequestId}
          onBack={handleBack}
        />
      );
    
    default:
      return (
        <Dashboard 
          onCreateNew={handleCreateNew}
          onViewRequest={handleViewRequest}
        />
      );
  }
};

export default Index;
