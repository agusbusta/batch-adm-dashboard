import React from 'react';
import Input from './Input';
import Button from './Button';

interface PrioritySelectorProps {
  currentPriority: number;
  onPriorityChange: (priority: number) => Promise<void>;
  isLoading?: boolean;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  currentPriority,
  onPriorityChange,
  isLoading = false,
}) => {
  const [priority, setPriority] = React.useState(currentPriority.toString());
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setPriority(currentPriority.toString());
  }, [currentPriority]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const numPriority = parseInt(priority, 10);
    if (isNaN(numPriority) || numPriority < 0) {
      return;
    }
    try {
      await onPriorityChange(numPriority);
      setIsEditing(false);
    } catch {
      // Error handling is done in parent
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setPriority(currentPriority.toString());
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
        <Input
          type="number"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-20"
          min="0"
        />
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
      <span className="text-sm font-medium text-gray-900">{currentPriority}</span>
      <Button variant="ghost" size="sm" onClick={handleEditClick}>
        Edit
      </Button>
    </div>
  );
};

export default PrioritySelector;

