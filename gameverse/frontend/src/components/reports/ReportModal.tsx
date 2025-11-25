import React, { useState } from 'react';
import { reportService } from '../../services/adminService';

interface ReportModalProps {
  itemType: 'user' | 'game' | 'review' | 'forum_thread' | 'forum_post';
  itemId: string;
  itemName: string;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  itemType, 
  itemId, 
  itemName, 
  onClose 
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(false);

  const reasons = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'false_information', label: 'False Information' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: '#28a745' },
    { value: 'medium', label: 'Medium', color: '#ffc107' },
    { value: 'high', label: 'High', color: '#fd7e14' },
    { value: 'critical', label: 'Critical', color: '#dc3545' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !description) {
      alert('Please provide a reason and description for your report.');
      return;
    }

    setLoading(true);
    try {
      await reportService.createReport({
        reportedItemType: itemType,
        reportedItem: itemId,
        reason,
        description,
        severity
      });
      
      alert('Report submitted successfully. Our team will review it shortly.');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-modal">
        <div className="modal-header">
          <h2>Report Content</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="report-target">
            Reporting: <strong>{itemName}</strong> ({itemType})
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Reason for Report *</label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                {reasons.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severity Level</label>
              <div className="severity-options">
                {severityLevels.map(level => (
                  <label key={level.value} className="severity-option">
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={severity === level.value}
                      onChange={(e) => setSeverity(e.target.value)}
                    />
                    <span 
                      className="severity-dot"
                      style={{ backgroundColor: level.color }}
                    ></span>
                    {level.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about why you are reporting this content..."
                required
                rows={5}
                maxLength={1000}
              />
              <div className="char-count">
                {description.length}/1000 characters
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;