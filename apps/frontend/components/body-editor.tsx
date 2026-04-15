// apps/frontend/components/BodyEditor.tsx  (Simplified)

"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface BodyEditorProps {
  body: string | null;
  onChange: (newBody: string | null) => void;
}

export default function BodyEditor({ body, onChange }: BodyEditorProps) {
  const [copied, setCopied] = React.useState(false);

  const handleChange = (value: string) => {
    onChange(value.trim() === "" ? null : value);
  };

  const copyBody = () => {
    if (!body) return;
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">Request Body</div>
        {body && (
          <Button
            variant="ghost"
            size="sm"
            onClick={copyBody}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy
          </Button>
        )}
      </div>

      <Textarea
        value={body || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter request body here...&#10;For JSON, write it naturally (it will be sent as string)"
        className="flex-1 font-mono text-sm resize-none bg-muted/50 leading-relaxed"
        spellCheck={false}
      />

      <div className="text-xs text-muted-foreground mt-2">
        The body will be sent as a string (as expected by the backend)
      </div>
    </div>
  );
}
