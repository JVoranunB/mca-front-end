import React, { useState } from 'react';
import {
  Text,
  Button,
  Modal,
  TextField,
  Select,
  FormLayout,
  Toast,
  Badge,
  InlineStack,
  Icon
} from '@shopify/polaris';
import {
  SaveIcon,
  FolderIcon,
  CheckCircleIcon,
  DeleteIcon,
  ChevronLeftIcon,
  EditIcon
} from '@shopify/polaris-icons';
import useWorkflowStore from '../store/workflowStore';

interface TopBarProps {
  onBackToList?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBackToList }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  
  const {
    saveWorkflow,
    loadWorkflow,
    clearWorkflow,
    deleteWorkflow,
    updateWorkflowName,
    workflows,
    currentWorkflow,
    validateWorkflow,
    isDirty,
    nodes,
    isSaving,
    saveError
  } = useWorkflowStore();
  
  const handleSave = async () => {
    if (!workflowName.trim()) {
      setToastMessage('Please enter a workflow name');
      setToastError(true);
      setShowToast(true);
      return;
    }
    
    const isValid = validateWorkflow();
    if (!isValid) {
      setToastMessage('Workflow has validation errors. Please fix them before saving.');
      setToastError(true);
      setShowToast(true);
      return;
    }
    
    try {
      const result = await saveWorkflow(workflowName, workflowDescription);
      
      setIsSaveModalOpen(false);
      setWorkflowName('');
      setWorkflowDescription('');
      
      if (result.success) {
        setToastMessage('✅ Workflow saved successfully (FAKE API) - Check console for request details');
        setToastError(false);
      } else {
        setToastMessage(result.error || 'Failed to save workflow');
        setToastError(true);
      }
      setShowToast(true);
    } catch {
      setToastMessage('Unexpected error occurred while saving');
      setToastError(true);
      setShowToast(true);
    }
  };
  
  const handleLoad = () => {
    if (!selectedWorkflowId) {
      setToastMessage('Please select a workflow to load');
      setToastError(true);
      setShowToast(true);
      return;
    }
    
    loadWorkflow(selectedWorkflowId);
    setIsLoadModalOpen(false);
    setSelectedWorkflowId('');
    setToastMessage('Workflow loaded successfully');
    setToastError(false);
    setShowToast(true);
  };
  
  const handleClear = () => {
    clearWorkflow();
    setToastMessage('Workflow cleared');
    setToastError(false);
    setShowToast(true);
  };
  
  const handleValidate = () => {
    const isValid = validateWorkflow();
    setToastMessage(isValid ? 'Workflow is valid!' : 'Workflow has validation errors');
    setToastError(!isValid);
    setShowToast(true);
  };

  const handleNameClick = () => {
    if (currentWorkflow) {
      setEditingName(currentWorkflow.name);
      setIsEditingName(true);
    }
  };

  const handleNameSave = () => {
    if (editingName.trim() && currentWorkflow && editingName !== currentWorkflow.name) {
      updateWorkflowName(editingName.trim());
      setToastMessage('Workflow name updated');
      setToastError(false);
      setShowToast(true);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditingName('');
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };
  
  const workflowOptions = workflows.map(w => ({
    label: `${w.name} (${new Date(w.createdAt).toLocaleDateString()})`,
    value: w.id
  }));
  
  return (
    <>
      <div style={{ 
        borderBottom: '1px solid #e1e3e5', 
        padding: '12px 16px',
        background: '#fff'
      }}>
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="400" blockAlign="center">
            {onBackToList && (
              <Button
                icon={ChevronLeftIcon}
                onClick={onBackToList}
                variant="plain"
                accessibilityLabel="Back to workflow list"
              />
            )}
            <Text as="h1" variant="headingXl">
              Workflow Builder
            </Text>
            {currentWorkflow && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div onKeyDown={handleNameKeyPress} style={{ minWidth: '200px' }}>
                      <TextField
                        label=""
                        value={editingName}
                        onChange={setEditingName}
                        onBlur={handleNameSave}
                        autoFocus
                        size="slim"
                        autoComplete="off"
                        placeholder="Enter workflow name"
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid transparent'
                    }}
                    onClick={handleNameClick}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f6f6f7';
                      e.currentTarget.style.border = '1px solid #e1e3e5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.border = '1px solid transparent';
                    }}
                  >
                    <Badge tone="info">
                      {currentWorkflow.name}
                    </Badge>
                    <div style={{ opacity: 0.6 }}>
                      <Icon source={EditIcon} tone="subdued" />
                    </div>
                  </div>
                )}
              </div>
            )}
            {isDirty && (
              <Badge tone="attention">
                Unsaved changes
              </Badge>
            )}
            {nodes.length > 0 && (
              <Badge>
                {`${nodes.length} nodes`}
              </Badge>
            )}
          </InlineStack>
          
          <InlineStack gap="200">
            <Button
              icon={SaveIcon}
              onClick={() => {
                if (currentWorkflow) {
                  setWorkflowName(currentWorkflow.name);
                  setWorkflowDescription(currentWorkflow.description || '');
                }
                setIsSaveModalOpen(true);
              }}
              variant="primary"
              loading={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              icon={FolderIcon}
              onClick={() => setIsLoadModalOpen(true)}
            >
              Load
            </Button>
            <Button
              icon={CheckCircleIcon}
              onClick={handleValidate}
            >
              Validate
            </Button>
            <Button
              icon={DeleteIcon}
              onClick={handleClear}
              tone="critical"
            >
              Clear
            </Button>
          </InlineStack>
        </InlineStack>
      </div>
      
      <Modal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Workflow"
        primaryAction={{
          content: isSaving ? 'Saving...' : 'Save',
          onAction: handleSave,
          loading: isSaving
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsSaveModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Workflow Name"
              value={workflowName}
              onChange={setWorkflowName}
              autoComplete="off"
              placeholder="Enter workflow name"
            />
            <TextField
              label="Description (Optional)"
              value={workflowDescription}
              onChange={setWorkflowDescription}
              multiline={3}
              autoComplete="off"
              placeholder="Describe what this workflow does"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
      
      <Modal
        open={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        title="Load Workflow"
        primaryAction={{
          content: 'Load',
          onAction: handleLoad,
          disabled: !selectedWorkflowId
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsLoadModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="Select Workflow"
              options={[
                { label: 'Choose a workflow...', value: '' },
                ...workflowOptions
              ]}
              value={selectedWorkflowId}
              onChange={setSelectedWorkflowId}
            />
            {selectedWorkflowId && workflows.find(w => w.id === selectedWorkflowId) && (
              <div style={{ marginTop: '16px' }}>
                <Text as="p" variant="bodyMd">
                  <strong>Description:</strong>{' '}
                  {workflows.find(w => w.id === selectedWorkflowId)?.description || 'No description'}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Nodes:</strong>{' '}
                  {workflows.find(w => w.id === selectedWorkflowId)?.nodes.length || 0}
                </Text>
                <Button
                  icon={DeleteIcon}
                  onClick={() => {
                    deleteWorkflow(selectedWorkflowId);
                    setSelectedWorkflowId('');
                    setToastMessage('Workflow deleted');
                    setToastError(false);
                    setShowToast(true);
                  }}
                  tone="critical"
                  fullWidth
                  variant="plain"
                >
                  Delete this workflow
                </Button>
              </div>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
      
      {showToast && (
        <Toast
          content={toastMessage}
          onDismiss={() => setShowToast(false)}
          error={toastError}
        />
      )}
      
      {saveError && (
        <Toast
          content={`Save Error: ${saveError}`}
          onDismiss={() => useWorkflowStore.getState().setSaveError(null)}
          error={true}
          duration={10000}
        />
      )}
    </>
  );
};

export default TopBar;