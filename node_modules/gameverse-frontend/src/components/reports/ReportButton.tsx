import React, { useState } from 'react';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  itemType: 'user' | 'game' | 'review' | 'forum_thread' | 'forum_post';
  itemId: string;
  itemName: string;
  size?: 'small' | 'medium' | 'large';
}

const ReportButton: React.FC<ReportButtonProps> = ({ 
  itemType, 
  itemId, 
  itemName, 
  size = 'medium' 
}) => {
  const [showModal, setShowModal] = useState(false);

  const getButtonSize = () => {
    switch (size) {
      case 'small': return '0.8rem';
      case 'large': return '1rem';
      default: return '0.9rem';
    }
  };

  return (
    <>
      <button 
        className="report-button"
        onClick={() => setShowModal(true)}
        title={`Report ${itemType}`}
        style={{ fontSize: getButtonSize() }}
      >
        <span className="report-icon">⚠️</span>
        Report
      </button>

      {showModal && (
        <ReportModal
          itemType={itemType}
          itemId={itemId}
          itemName={itemName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ReportButton;