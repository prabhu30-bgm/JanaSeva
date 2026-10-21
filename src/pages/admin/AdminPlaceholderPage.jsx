import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { PageHeader, EmptyState, Button, Alert } from '@janaseva/ui';

export function PlaceholderPage({ title, description, category }) {
  const location = useLocation();
  const displayTitle = title || location.pathname.replace('/', '').toUpperCase();

  return (
    <div>
      <PageHeader
        title={displayTitle}
        subtitle={description || 'Administrative governance and record management module.'}
      />

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Alert
          variant="info"
          title="Module Foundation in Place (Step 3 Design System)"
        >
          This view has its navigation route and visual architecture integrated with the shared JanaSeva design system. The full backend transactional workflows and authoritative database mutations will be bound in upcoming feature milestones.
        </Alert>
      </div>

      <EmptyState
        icon={Construction}
        title={`${displayTitle} Module`}
        description="This section adheres to the JanaSeva administrative governance layout. Functional endpoints and interactive workflows will be active once business logic is implemented."
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>
            Return to Previous Screen
          </Button>
        }
      />
    </div>
  );
}

export default PlaceholderPage;
