import React from 'react';
import { Modal } from '@shopify/polaris';

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  primaryAction?: {
    content: string;
    onAction: () => void;
  };
  secondaryActions?: Array<{
    content: string;
    onAction: () => void;
  }>;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  title = "Error",
  message,
  primaryAction,
  secondaryActions
}) => {
  const defaultPrimaryAction = {
    content: 'Close',
    onAction: onClose,
    destructive: true
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`❌ ${title}`}
      primaryAction={primaryAction || defaultPrimaryAction}
      secondaryActions={secondaryActions}
      sectioned
    >
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#fef2f2', 
        border: '1px solid #fecaca', 
        borderRadius: '6px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          fontFamily: 'monospace', 
          whiteSpace: 'pre-line', 
          lineHeight: '1.5',
          color: '#dc2626'
        }}>
          {message}
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;