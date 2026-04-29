"use client";
import { useReqVaultContext } from "@/hooks/use-vault";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Trash2 } from "lucide-react";
import type { ReqVaultRequest } from "@/types";

const RequestListItem = ({
  request,
  onClick,
  onDelete,
  isActive,
}: {
  request: ReqVaultRequest;
  onClick: () => void;
  onDelete: () => void;
  isActive: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={`group/item relative p-2 rounded-md cursor-pointer transition-colors mb-0.5 hover:bg-accent/50 ${
        isActive ? "bg-accent text-accent-foreground" : ""
      }`}
    >
      <div className="flex items-center gap-0">
        {/* Method Badge - Keep it from shrinking */}
        <Badge
          variant="outline"
          className={`font-mono text-xs shrink-0 ${getMethodColor(request.method)}`}
        >
          {request.method}
        </Badge>

        {/* Name + URL Container */}
        <div className="min-w-0 flex-1 pl-2 overflow-hidden">
          <p className="font-medium text-sm whitespace-nowrap mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
            {request.name}
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
            {request.url}
          </p>
        </div>

        {/* Delete Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          // shrink-0 prevents the button from collapsing when the URL is long
          className="h-7 w-7 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${request.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-emerald-600 border-emerald-600/30";
    case "POST":
      return "text-blue-600 border-blue-600/30";
    case "PUT":
      return "text-amber-600 border-amber-600/30";
    case "PATCH":
      return "text-purple-600 border-purple-600/30";
    case "DELETE":
      return "text-red-600 border-red-600/30";
    default:
      return "text-gray-600 border-gray-600/30";
  }
};

export function AppSidebar() {
  const {
    requestsList,
    loadAllRequests,
    selectRequest,
    deleteRequest,
    createNewRequest,
    currentRequest,
  } = useReqVaultContext();

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col">
        <h1 className="text-2xl text-primary text-center">crimson</h1>
        <span className="text-xs text-center text-muted-foreground">
          V-0.0.0-dev
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Button onClick={() => createNewRequest()} size="sm">
            New Request
          </Button>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Collections
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="">
                {/* Request List */}
                <div className="flex-1 overflow-auto px-0">
                  {requestsList.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No saved requests yet.
                      <br />
                      Create one above.
                    </div>
                  ) : (
                    requestsList.map((req) => (
                      <RequestListItem
                        key={req.id}
                        request={req}
                        onClick={() => selectRequest(req)}
                        onDelete={() => req.id && deleteRequest(req.id)}
                        isActive={currentRequest?.id === req.id}
                      />
                    ))
                  )}
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
