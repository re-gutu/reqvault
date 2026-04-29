"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export type KeyValuePair = {
  key: string;
  value: string;
};

interface KeyValueEditorProps {
  title: string;
  pairs: KeyValuePair[];
  onChange: (newPairs: KeyValuePair[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}

export default function KeyValueEditor({
  title,
  pairs,
  onChange,
  placeholderKey = "Key",
  placeholderValue = "Value",
}: KeyValueEditorProps) {
  const addPair = () => {
    onChange([...pairs, { key: "", value: "" }]);
  };

  const updatePair = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    const updated = [...pairs];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const removePair = (index: number) => {
    const updated = pairs.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addPair}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {pairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No {title.toLowerCase()} added yet. Click "Add" to begin.
          </div>
        ) : (
          pairs.map((pair, index) => (
            <div key={index} className="flex gap-2 group">
              <Input
                placeholder={placeholderKey}
                value={pair.key}
                onChange={(e) => updatePair(index, "key", e.target.value)}
                className="font-mono"
              />
              <Input
                placeholder={placeholderValue}
                value={pair.value}
                onChange={(e) => updatePair(index, "value", e.target.value)}
                className="font-mono"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePair(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-primary" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
