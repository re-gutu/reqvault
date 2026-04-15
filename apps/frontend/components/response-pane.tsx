"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "./ui/badge";
import { useReqVaultContext } from "@/hooks/use-vault";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatResponseTimestamp(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ResponseHeadersList({
  headers,
}: {
  headers: Record<string, string> | undefined;
}) {
  const entries = headers ? Object.entries(headers) : [];

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No headers</p>
    );
  }

  return (
    <dl className="font-mono text-sm space-y-2">
      {entries.map(([name, value]) => (
        <div
          key={name}
          className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-3 gap-y-0.5 items-baseline border-b border-border/40 pb-2 last:border-0 last:pb-0 font-mono"
        >
          <dt className="text-primary">
            {name} | 
          </dt>
          <dd className="min-w-0 break-all text-foreground select-text">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ResponseBodyContent({ body }: { body: string | null | undefined }) {
  if (!body) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No response body
      </div>
    );
  }

  // Try to detect and pretty-print JSON
  let displayContent = body;
  let isJson = false;

  try {
    // Check if it looks like JSON
    if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
      const parsed = JSON.parse(body);
      displayContent = JSON.stringify(parsed, null, 2);  // Pretty print with 2 spaces
      isJson = true;
    }
  } catch {
    // Not valid JSON → keep original string
    isJson = false;
  }

  return (
    <div className="h-full overflow-auto bg-muted/50 p-4 font-mono text-sm leading-relaxed">
      <pre className="whitespace-pre-wrap break-all select-text">
        {displayContent}
      </pre>
    </div>
  );
}

const ResponsePane = () => {
  const { currentResponse, isLoading } = useReqVaultContext();

  const placeholder = isLoading ? "…" : "—";
  const statusCodeLabel = isLoading
    ? "Sending"
    : currentResponse
      ? String(currentResponse.status)
      : "No response";
  const statusTextLabel = isLoading
    ? placeholder
    : currentResponse?.statusText ?? placeholder;
  const durationLabel = isLoading
    ? placeholder
    : currentResponse
      ? `${currentResponse.durationMs} ms`
      : placeholder;
  const sizeLabel = isLoading
    ? placeholder
    : currentResponse
      ? formatBytes(currentResponse.sizeBytes)
      : placeholder;
  const headerCountLabel = isLoading
    ? placeholder
    : currentResponse?.headers != null
      ? `${Object.keys(currentResponse.headers).length} headers`
      : placeholder;
  const timestampLabel = isLoading
    ? placeholder
    : formatResponseTimestamp(currentResponse?.timestamp);

  return (
    <div className="w-full h-full ">
      <div className="p-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm">
        <Badge variant={"ghost"} className="border-l-primary shrink-0">
          {statusCodeLabel}
        </Badge>
        <Badge variant={"ghost"} className="text-muted-foreground shrink-0">
          {statusTextLabel}
        </Badge>
        <Badge variant={"ghost"} className="text-muted-foreground shrink-0">
          {durationLabel}
        </Badge>
        <Badge variant={"ghost"} className="text-muted-foreground shrink-0">
          {sizeLabel}
        </Badge>
        <Badge variant={"ghost"} className="text-muted-foreground shrink-0">
          {headerCountLabel}
        </Badge>
        <Badge variant={"ghost"} className="text-muted-foreground shrink-0">
          {timestampLabel}
        </Badge>
      </div>
      <Tabs defaultValue="body" className="w-full h-full">
        <TabsList variant={"line"} className="w-full flex justify-between p-0">
          <div>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="body">
          <div className="w-full h-full min-h-0 overflow-auto bg-muted p-">
            <ResponseBodyContent body={currentResponse?.body} />{" "}
          </div>
        </TabsContent>
        <TabsContent value="headers">
          <div className="w-full h-full min-h-0 overflow-auto bg- p-4">
            <ResponseHeadersList headers={currentResponse?.headers} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResponsePane;
