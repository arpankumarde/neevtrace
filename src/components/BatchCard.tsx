import React from 'react';
import { format } from 'date-fns';

interface BatchCardProps {
  batch: {
    expiryDate: string | null;
  };
}

const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div>
      <div>Expiry Date: {formatDate(batch.expiryDate)}</div>
    </div>
  );
};

export default BatchCard;