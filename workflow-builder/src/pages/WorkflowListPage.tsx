import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  ButtonGroup,
  EmptyState,
  Filters,
  ChoiceList,
  Badge,
  Tooltip,
  Modal,
  TextContainer,
  InlineStack,
  Toast,
  Frame,
  Link
} from '@shopify/polaris';
import {
  PlayIcon,
  EditIcon,
  DuplicateIcon,
  DeleteIcon,
  PlusIcon,
  SettingsFilledIcon,
  CalendarIcon
} from '@shopify/polaris-icons';
import useWorkflowStore from '../store/workflowStore';
import type { TriggerType, WorkflowSummary } from '../types/workflow.types';

interface Filters {
  triggerType: TriggerType[];
  status: string[];
  search: string;
}

const WorkflowListPage = () => {
  const navigate = useNavigate();
  const {
    getAllWorkflows,
    createWorkflowFromType,
    duplicateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus
  } = useWorkflowStore();

  const [filters, setFilters] = useState<Filters>({
    triggerType: [],
    status: [],
    search: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const workflows = getAllWorkflows();

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      const matchesTriggerType = filters.triggerType.length === 0 || 
        filters.triggerType.includes(workflow.triggerType);
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(workflow.status);
      const matchesSearch = !filters.search || 
        workflow.name.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesTriggerType && matchesStatus && matchesSearch;
    });
  }, [workflows, filters]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastActive(true);
  };

  const handleCreateWorkflow = (triggerType: TriggerType) => {
    const workflowId = createWorkflowFromType(triggerType);
    navigate(`/workflow/${workflowId}/edit`);
  };

  const handleEditWorkflow = (workflowId: string) => {
    navigate(`/workflow/${workflowId}/edit`);
  };

  const handleDuplicateWorkflow = (workflowId: string) => {
    const newWorkflowId = duplicateWorkflow(workflowId);
    if (newWorkflowId) {
      showToast('Workflow duplicated successfully');
    }
  };

  const handleToggleStatus = (workflowId: string) => {
    toggleWorkflowStatus(workflowId);
    showToast('Workflow status updated');
  };

  const handleDeleteClick = (workflowId: string) => {
    setWorkflowToDelete(workflowId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (workflowToDelete) {
      deleteWorkflow(workflowToDelete);
      showToast('Workflow deleted successfully');
      setDeleteModalOpen(false);
      setWorkflowToDelete(null);
    }
  };

  const handleFiltersQueryChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleTriggerTypeFilterChange = (value: string[]) => {
    setFilters({ ...filters, triggerType: value as TriggerType[] });
  };

  const handleStatusFilterChange = (value: string[]) => {
    setFilters({ ...filters, status: value });
  };

  const handleFiltersClearAll = () => {
    setFilters({
      triggerType: [],
      status: [],
      search: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTriggerTypeBadge = (triggerType: TriggerType) => {
    return triggerType === 'event-based' ? (
      <Badge tone="info" icon={SettingsFilledIcon}>Event-Based</Badge>
    ) : (
      <Badge tone="attention" icon={CalendarIcon}>Schedule-Based</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { tone: 'success' as const, text: 'Active' },
      paused: { tone: 'warning' as const, text: 'Paused' },
      draft: { tone: 'info' as const, text: 'Draft' }
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge tone={config.tone}>{config.text}</Badge>;
  };

  const renderActions = (workflow: WorkflowSummary) => {
    return (
      <InlineStack gap="200">
        <Tooltip content="Edit workflow">
          <Button
            variant="plain"
            icon={EditIcon}
            onClick={() => handleEditWorkflow(workflow.id)}
            accessibilityLabel={`Edit ${workflow.name}`}
          />
        </Tooltip>
        
        <Tooltip content="Duplicate workflow">
          <Button
            variant="plain"
            icon={DuplicateIcon}
            onClick={() => handleDuplicateWorkflow(workflow.id)}
            accessibilityLabel={`Duplicate ${workflow.name}`}
          />
        </Tooltip>
        
        <Tooltip content={workflow.status === 'active' ? 'Pause workflow' : 'Activate workflow'}>
          <Button
            variant="plain"
            icon={PlayIcon}
            onClick={() => handleToggleStatus(workflow.id)}
            accessibilityLabel={`${workflow.status === 'active' ? 'Pause' : 'Activate'} ${workflow.name}`}
          />
        </Tooltip>
        
        <Tooltip content="Delete workflow">
          <Button
            variant="plain"
            icon={DeleteIcon}
            tone="critical"
            onClick={() => handleDeleteClick(workflow.id)}
            accessibilityLabel={`Delete ${workflow.name}`}
          />
        </Tooltip>
      </InlineStack>
    );
  };

  const rows = filteredWorkflows.map((workflow) => [
    <Link
      onClick={() => handleEditWorkflow(workflow.id)}
      removeUnderline
      monochrome
    >
      {workflow.name}
    </Link>,
    getTriggerTypeBadge(workflow.triggerType),
    getStatusBadge(workflow.status),
    workflow.nodeCount.toString(),
    formatDate(workflow.lastModified),
    workflow.lastTriggered ? formatDate(workflow.lastTriggered) : '—',
    renderActions(workflow)
  ]);

  const emptyStateMarkup = workflows.length === 0 ? (
    <EmptyState
      heading="Create your first workflow"
      action={{
        content: 'Create Event-Based Workflow',
        onAction: () => handleCreateWorkflow('event-based')
      }}
      secondaryAction={{
        content: 'Create Schedule-Based Workflow',
        onAction: () => handleCreateWorkflow('schedule-based')
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <TextContainer>
        <p>
          Workflows help you automate your business processes. Create event-based workflows 
          that respond to data changes or schedule-based workflows that run at specific times.
        </p>
      </TextContainer>
    </EmptyState>
  ) : filteredWorkflows.length === 0 ? (
    <EmptyState
      heading="No workflows match your filters"
      action={{
        content: 'Clear filters',
        onAction: handleFiltersClearAll
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <TextContainer>
        <p>Try adjusting your search or filter criteria.</p>
      </TextContainer>
    </EmptyState>
  ) : null;

  const appliedFilters = [];
  if (filters.triggerType.length > 0) {
    appliedFilters.push({
      key: 'triggerType',
      label: `Trigger Type: ${filters.triggerType.join(', ')}`,
      onRemove: () => setFilters({ ...filters, triggerType: [] })
    });
  }
  if (filters.status.length > 0) {
    appliedFilters.push({
      key: 'status',
      label: `Status: ${filters.status.join(', ')}`,
      onRemove: () => setFilters({ ...filters, status: [] })
    });
  }

  const filterControl = (
    <Filters
      queryValue={filters.search}
      filters={[
        {
          key: 'triggerType',
          label: 'Trigger Type',
          filter: (
            <ChoiceList
              title="Trigger Type"
              titleHidden
              choices={[
                { label: 'Event-Based', value: 'event-based' },
                { label: 'Schedule-Based', value: 'schedule-based' }
              ]}
              selected={filters.triggerType}
              onChange={handleTriggerTypeFilterChange}
              allowMultiple
            />
          ),
          shortcut: true
        },
        {
          key: 'status',
          label: 'Status',
          filter: (
            <ChoiceList
              title="Status"
              titleHidden
              choices={[
                { label: 'Active', value: 'active' },
                { label: 'Paused', value: 'paused' },
                { label: 'Draft', value: 'draft' }
              ]}
              selected={filters.status}
              onChange={handleStatusFilterChange}
              allowMultiple
            />
          ),
          shortcut: true
        }
      ]}
      appliedFilters={appliedFilters}
      onQueryChange={handleFiltersQueryChange}
      onQueryClear={() => setFilters({ ...filters, search: '' })}
      onClearAll={handleFiltersClearAll}
      queryPlaceholder="Search workflows..."
    />
  );

  const toastMarkup = toastActive ? (
    <Toast content={toastMessage} onDismiss={() => setToastActive(false)} />
  ) : null;

  return (
    <Frame>
      <Page
        title="Workflows"
        primaryAction={
          <ButtonGroup>
            <Button
              variant="primary"
              icon={PlusIcon}
              onClick={() => handleCreateWorkflow('event-based')}
            >
              Create Event-Based Workflow
            </Button>
            <Button
              icon={PlusIcon}
              onClick={() => handleCreateWorkflow('schedule-based')}
            >
              Create Schedule-Based Workflow
            </Button>
          </ButtonGroup>
        }
      >
        <Layout>
          <Layout.Section>
            <Card>
              {emptyStateMarkup || (
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text', 'text']}
                  headings={[
                    'Name',
                    'Trigger Type',
                    'Status',
                    'Nodes',
                    'Last Modified',
                    'Last Triggered',
                    'Actions'
                  ]}
                  rows={rows}
                  sortable={[true, true, true, true, true, true, false]}
                  defaultSortDirection="descending"
                  initialSortColumnIndex={4}
                />
              )}
            </Card>
          </Layout.Section>

          {!emptyStateMarkup && (
            <Layout.Section>
              <Card>
                {filterControl}
              </Card>
            </Layout.Section>
          )}
        </Layout>

        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete workflow"
          primaryAction={{
            content: 'Delete',
            destructive: true,
            onAction: handleDeleteConfirm
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setDeleteModalOpen(false)
            }
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <p>
                Are you sure you want to delete this workflow? This action cannot be undone.
              </p>
            </TextContainer>
          </Modal.Section>
        </Modal>

        {toastMarkup}
      </Page>
    </Frame>
  );
};

export default WorkflowListPage;