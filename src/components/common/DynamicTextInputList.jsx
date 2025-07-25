import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const DynamicTextInputList = forwardRef(({ label, value, onChange, placeholder = 'Add new item...', disabled }, ref) => {
  // Add this line to ensure label always has a string value
  const effectiveLabel = label || 'Item'; // Default to 'Item' if label is undefined or null

  const [newItemValue, setNewItemValue] = useState('');
  const newItemInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      newItemInputRef.current?.focus();
    },
  }));

  const handleAddItem = () => {
    const trimmedValue = newItemValue.trim();
    if (trimmedValue) {
      if (!value.includes(trimmedValue)) { // Basic check for uniqueness
        onChange([...value, trimmedValue]);
        setNewItemValue('');
        newItemInputRef.current?.focus(); // Keep focus on input after adding
      } else {
        toast.warning(`"${trimmedValue}" is already in the list.`);
      }
    } else {
      // Use effectiveLabel here
      toast.warning(`${effectiveLabel.slice(0, -1) || 'Item'} cannot be empty.`);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };

  const handleItemChange = (index, newValue) => {
    const updatedValue = [...value];
    updatedValue[index] = newValue;
    onChange(updatedValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddItem();
    }
  };

  return (
    <div className="space-y-4">
      {/* Use effectiveLabel for display */}
      <h4 className="font-medium text-foreground">{effectiveLabel}</h4>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        {value.map((item, index) => (
          <li key={index} className="flex items-center justify-between group">
            <Input
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              className="flex-grow mr-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={disabled}
            />
            <Button type="button" variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveItem(item)} disabled={disabled}>
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-2">
        <Input
          ref={newItemInputRef}
          value={newItemValue}
          onChange={(e) => setNewItemValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button type="button" onClick={handleAddItem} disabled={disabled || !newItemValue.trim()}>
          <Plus className="h-4 w-4 mr-2" /> Add {effectiveLabel.replace(/s$/, '')} {/* Use effectiveLabel here */}
        </Button>
      </div>
    </div>
  );
});

DynamicTextInputList.displayName = 'DynamicTextInputList';

export default DynamicTextInputList;