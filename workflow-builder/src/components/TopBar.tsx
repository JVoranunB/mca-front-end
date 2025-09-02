import React, { useState } from 'react';
import {
  Text,
  Button,
  Modal,
  TextField,
  Select,
  FormLayout,
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
  EditIcon,
  SettingsFilledIcon,
  CalendarIcon
} from '@shopify/polaris-icons';
import useWorkflowStore from '../store/workflowStore';
import { SuccessModal, ErrorModal } from './modals';

interface TopBarProps {
  onBackToList?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBackToList }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationErrorMessages, setValidationErrorMessages] = useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    saveWorkflow,
    loadWorkflow,
    clearWorkflow,
    deleteWorkflow,
    updateWorkflowName,
    workflows,
    currentWorkflow,
    validateWorkflow,
    validationErrors,
    isDirty,
    nodes,
    isSaving,
    saveError
  } = useWorkflowStore();
  
  const handleSave = async () => {
    if (!workflowName.trim()) {
      setErrorMessage('Please enter a workflow name');
      setIsErrorModalOpen(true);
      return;
    }
    
    const isValid = validateWorkflow();
    if (!isValid) {
      // Get fresh validation errors from the store after validation
      const freshValidationErrors = useWorkflowStore.getState().validationErrors;
      
      // Generate detailed error message
      const errorMessages = freshValidationErrors.map(error => {
        const prefix = error.severity === 'error' ? '🚫' : '⚠️';
        const nodeInfo = error.nodeId ? ` (Node: ${error.nodeId})` : '';
        return `${prefix} ${error.message}${nodeInfo}`;
      });
      
      const errorCount = freshValidationErrors.filter(e => e.severity === 'error').length;
      const warningCount = freshValidationErrors.filter(e => e.severity === 'warning').length;
      
      let summary = '';
      if (errorCount > 0) {
        summary += `${errorCount} error${errorCount > 1 ? 's' : ''}`;
      }
      if (warningCount > 0) {
        if (summary) summary += ` and `;
        summary += `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
      }
      
      // Show detailed errors in a modal for better formatting
      setValidationErrorMessages([
        `Workflow has ${summary}:`,
        '',
        ...errorMessages,
        '',
        'Please fix the errors before saving.'
      ]);
      setIsValidationModalOpen(true);
      return;
    }
    
    try {
      const result = await saveWorkflow(workflowName, workflowDescription);
      
      setIsSaveModalOpen(false);
      setWorkflowName('');
      setWorkflowDescription('');
      
      if (result.success) {
        setSuccessMessage('Workflow saved successfully!\n\nYour workflow has been saved to the workspace. You can continue editing or navigate back to the workflow list.');
        setIsSuccessModalOpen(true);
      } else {
        setErrorMessage(result.error || 'Failed to save workflow');
        setIsErrorModalOpen(true);
      }
    } catch {
      setErrorMessage('Unexpected error occurred while saving');
      setIsErrorModalOpen(true);
    }
  };
  
  const handleLoad = () => {
    if (!selectedWorkflowId) {
      setErrorMessage('Please select a workflow to load');
      setIsErrorModalOpen(true);
      return;
    }
    
    loadWorkflow(selectedWorkflowId);
    setIsLoadModalOpen(false);
    setSelectedWorkflowId('');
    setSuccessMessage('Workflow loaded successfully!\n\nThe selected workflow has been loaded into the editor.');
    setIsSuccessModalOpen(true);
  };
  
  const handleClear = () => {
    clearWorkflow();
    setSuccessMessage('Workflow cleared!\n\nThe canvas has been cleared and is ready for a new workflow.');
    setIsSuccessModalOpen(true);
  };
  
  const handleValidate = () => {
    const isValid = validateWorkflow();
    if (isValid) {
      setSuccessMessage('Workflow is valid!\n\nAll workflow components are properly configured and connected.');
      setIsSuccessModalOpen(true);
    } else {
      // Get fresh validation errors from the store after validation
      const freshValidationErrors = useWorkflowStore.getState().validationErrors;
      
      // Generate detailed error message (same as save function)
      const errorMessages = freshValidationErrors.map(error => {
        const prefix = error.severity === 'error' ? '🚫' : '⚠️';
        const nodeInfo = error.nodeId ? ` (Node: ${error.nodeId})` : '';
        return `${prefix} ${error.message}${nodeInfo}`;
      });
      
      const errorCount = freshValidationErrors.filter(e => e.severity === 'error').length;
      const warningCount = freshValidationErrors.filter(e => e.severity === 'warning').length;
      
      let summary = '';
      if (errorCount > 0) {
        summary += `${errorCount} error${errorCount > 1 ? 's' : ''}`;
      }
      if (warningCount > 0) {
        if (summary) summary += ` and `;
        summary += `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
      }
      
      // Show detailed errors in validation modal
      setValidationErrorMessages([
        `Workflow has ${summary}:`,
        '',
        ...errorMessages,
        '',
        'Please fix the errors before saving.'
      ]);
      setIsValidationModalOpen(true);
    }
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
      setSuccessMessage('Workflow name updated!\n\nThe workflow name has been changed successfully.');
      setIsSuccessModalOpen(true);
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
            {currentWorkflow && (
              <Badge 
                tone={currentWorkflow.triggerType === 'event-based' ? 'attention' : 'info'}
                icon={currentWorkflow.triggerType === 'event-based' ? SettingsFilledIcon : CalendarIcon}
              >
                {currentWorkflow.triggerType === 'event-based' ? 'Event-based' : 'Schedule-based'}
              </Badge>
            )}
            {nodes.length > 0 && (
              <Badge>
                {`${nodes.length} nodes`}
              </Badge>
            )}
            {isDirty && (
              <Badge tone="attention">
                Unsaved changes
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

      <ErrorModal
        open={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        title="Workflow Validation Errors"
        message={validationErrorMessages.join('\n')}
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
        primaryAction={{
          content: 'Continue Editing',
          onAction: () => setIsSuccessModalOpen(false)
        }}
        secondaryActions={[
          {
            content: 'Back to List',
            onAction: () => {
              setIsSuccessModalOpen(false);
              if (onBackToList) {
                onBackToList();
              }
            }
          }
        ]}
      />
      
      
      <ErrorModal
        open={isErrorModalOpen || !!saveError}
        onClose={() => {
          setIsErrorModalOpen(false);
          if (saveError) {
            useWorkflowStore.getState().setSaveError(null);
          }
        }}
        title="Error"
        message={saveError ? `Save Error: ${saveError}` : errorMessage}
      />
    </>
  );
};

export default TopBar;