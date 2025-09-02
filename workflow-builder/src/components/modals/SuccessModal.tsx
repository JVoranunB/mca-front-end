import React from 'react';
import { Modal } from '@shopify/polaris';

interface SuccessModalProps {
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

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  title = "Success",
  message,
  primaryAction,
  secondaryActions
}) => {
  const defaultPrimaryAction = {
    content: 'OK',
    onAction: onClose
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`✅ ${title}`}
      primaryAction={primaryAction || defaultPrimaryAction}
      secondaryActions={secondaryActions}
      sectioned
    >
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: '6px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          whiteSpace: 'pre-line', 
          lineHeight: '1.5',
          color: '#059669'
        }}>
          {message}
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;