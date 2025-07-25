// src/components/common/TagInput.jsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * A reusable component for managing a list of tags.
 * Users can type a tag, press Enter/Comma to add it, and click 'X' to remove.
 * Displays existing tags as badges.
 *
 * @param {object} props - Component props.
 * @param {string[]} props.value - The current array of tags.
 * @param {(newValue: string[]) => void} props.onChange - Callback fired when the tags array changes.
 * @param {string} [props.placeholder] - Placeholder text for the input field.
 * @param {boolean} [props.disabled] - Whether the input and buttons are disabled.
 */
const TagInput = forwardRef(({ value, onChange, placeholder = 'Add a tag...', disabled }, ref) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Expose focus method for external control (e.g., from react-hook-form's ref)
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    // Add other imperative methods if needed
  }));

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
      inputRef.current?.focus(); // Keep focus on input after adding
    } else if (trimmedValue && value.includes(trimmedValue)) {
      toast.warning(`"${trimmedValue}" is already added.`);
    } else {
      toast.warning('Tag cannot be empty.');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Prevent form submission if part of a form
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveTag(tag)} />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button type="button" onClick={handleAddTag} disabled={disabled || !inputValue.trim()}>
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>
    </div>
  );
});

TagInput.displayName = 'TagInput';

export default TagInput;
