import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags, 
  onTagsChange,
  className 
}) => {
  const { data, addCustomTag } = useApp();
  const { customTags } = data;
  const [newTag, setNewTag] = useState('');
  const [showInput, setShowInput] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      addCustomTag(trimmedTag);
      onTagsChange([...selectedTags, trimmedTag]);
    } else if (customTags.includes(trimmedTag) && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
    }
    setNewTag('');
    setShowInput(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Etiquetas
      </label>
      
      <div className="flex flex-wrap gap-2">
        {customTags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105',
              selectedTags.includes(tag) && 'bg-primary text-primary-foreground'
            )}
            onClick={() => toggleTag(tag)}
          >
            {tag}
            {selectedTags.includes(tag) && (
              <X className="w-3 h-3 ml-1" />
            )}
          </Badge>
        ))}
        
        {!showInput ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setShowInput(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Nueva
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nueva etiqueta"
              className="h-7 w-32 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              onClick={handleAddTag}
            >
              Añadir
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowInput(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
