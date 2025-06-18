"use client";

import React, {
  useState,
  useEffect,
  useOptimistic,
  startTransition,
} from "react";
import { useChat, type Message } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useSWRConfig } from "swr";
import Link from "next/link";

// shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// local components
import MemoizedMarkdown from "./tools/MemoizedMarkdown";
import ReasoningContent from "./tools/Reasoning";
import SourceView from "./tools/SourceView";
import DocumentSearchTool from "./tools/DocumentChatTool";
import WebsiteSearchTool from "./tools/WebsiteChatTool";
import MessageInput from "./ChatMessageInput";
import { ChatScrollAnchor } from "../hooks/chat-scroll-anchor";
import { setModelSettings } from "../actions";

import { toast } from "sonner";

// Medical icons
import {
  Menu,
  X,
  Sun,
  Moon,
  Copy,
  CheckCircle,
  FileIcon,
  Activity,
  Clock,
  Stethoscope,
  UserCheck,
} from "lucide-react";

interface ChatProps {
  currentChat?: Message[];
  chatId: string;
  initialModelType: string;
  initialSelectedOption: string;
}

/* -------------------------------------------------------------------------- */
/*                    MEDICAL ENHANCED CHAT - EXISTING STRUCTURE             */
/* -------------------------------------------------------------------------- */

const EnhancedChatComponent: React.FC<ChatProps> = ({
  currentChat,
  chatId,
  initialModelType,
  initialSelectedOption,
}) => {
  /* ----------------------------- ROUTER PARAM ----------------------------- */
  const param = useParams();
  const currentChatId = param.id as string;

  /* --------------------------- OPTIMISTIC STATE --------------------------- */
  const [optimisticModelType, setOptimisticModelType] = useOptimistic<
    string,
    string
  >(initialModelType, (_, v) => v);
  const [optimisticOption, setOptimisticOption] = useOptimistic<string, string>(
    initialSelectedOption,
    (_, v) => v
  );

  /* ------------------------------ UI STATES ------------------------------ */
  const [isCopied, setIsCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* --------------------------- HANDLE SETTINGS --------------------------- */
  const handleModelTypeChange = async (val: string) => {
    startTransition(async () => {
      setOptimisticModelType(val);
      await setModelSettings(val, optimisticOption);
    });
  };

  const handleOptionChange = async (val: string) => {
    startTransition(async () => {
      setOptimisticOption(val);
      await setModelSettings(optimisticModelType, val);
    });
  };

  /* ------------------------- API ENDPOINT HELPER ------------------------- */
  const apiEndpoint = (() => {
    switch (optimisticModelType) {
      case "perplex":
        return "/api/perplexity";
      case "website":
        return "/api/websitechat";
      default:
        return "/api/chat";
    }
  })();

  /* ------------------------------ CHAT HOOK ------------------------------ */
  const { mutate } = useSWRConfig();
  const { messages, status } = useChat({
    id: "chat",
    api: apiEndpoint,
    experimental_throttle: 50,
    initialMessages: currentChat,
    onFinish: async () => {
      if (chatId === currentChatId) return;
      await mutate((key) => Array.isArray(key) && key[0] === "chatPreviews");
    },
    onError: (e) => toast.error(e.message || "Something went wrong"),
  });

  /* ---------------------------- EFFECTS / MEDIA --------------------------- */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* --------------------------- THEME TOGGLER --------------------------- */
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  /* ---------------------------------------------------------------------- */
  /*                               RENDERING                               */
  /* ---------------------------------------------------------------------- */

  /* ------------------------------ SIDEBAR ------------------------------ */
  const SidebarContent = () => (
    <div className="flex flex-col h-full w-64 bg-background border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-orange-600">MDEvidence AI</h2>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {/* Real chat list - placeholder for future implementation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm text-muted-foreground">
        <p className="text-orange-600">Chat history will appear here when implemented.</p>
      </div>
    </div>
  );

  /* ----------------------------- MAIN JSX ----------------------------- */
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* ---------------------------- HEADER ---------------------------- */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            {/* mobile menu */}
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}

            {/* Medical logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <Link href="/" className="text-lg font-bold">
                <span className="text-orange-600">MDEvidence</span> AI
              </Link>
            </div>
          </div>

          {/* right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {!isMobile && sidebarOpen && <SidebarContent />}

        {/* ------------------------- CHAT AREA ------------------------- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">
                  <span className="text-orange-600">MDEvidence</span> Medical AI
                </h2>
                <p className="max-w-md text-muted-foreground">
                  Ask medical questions and get evidence-based AI responses for healthcare professionals.
                </p>
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Stethoscope className="w-4 h-4" />
                  <span>Trusted by healthcare professionals worldwide</span>
                </div>
              </div>
            ) : (
              <ul className="w-full mx-auto max-w-[1000px] px-2 sm:px-4 py-2 sm:py-4">
                {messages.map((m, idx) => {
                  const isUser = m.role === "user";

                  const textParts = m.parts?.filter((p) => p.type === "text") || [];
                  const reasoningParts = m.parts?.filter((p) => p.type === "reasoning") || [];
                  const sourceParts = m.parts?.filter((p) => p.type === "source") || [];
                  const toolInvocationParts = !isUser
                    ? m.parts?.filter((p) => p.type === "tool-invocation") || []
                    : [];
                  const hasTools = toolInvocationParts.length > 0;

                  const handleCopy = () => {
                    navigator.clipboard.writeText(m.content || "");
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 800);
                  };

                  return (
                    <li key={`${m.id}-${idx}`} className="my-2 sm:my-4">
                      <Card
                        className={`transition shadow-sm hover:shadow-md border ${
                          isUser ? "bg-orange-50/50 border-orange-200" : "bg-card border-border/60"
                        }`}
                      >
                        {/* ------------ Header row ------------- */}
                        <CardHeader className="pb-2 px-3 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`rounded-full flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 ${
                                isUser 
                                  ? "bg-gradient-to-br from-orange-600 to-orange-700" 
                                  : "bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200"
                              }`}
                            >
                              {isUser ? (
                                <UserCheck className="h-4 w-4 text-white" />
                              ) : (
                                <Stethoscope className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-xs sm:text-sm truncate">
                                  {isUser ? "Healthcare Professional" : "MDEvidence AI"}
                                </h3>
                                {!isUser && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                    Evidence-Based
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {m.createdAt
                                  ? new Date(m.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })
                                  : ""}
                              </p>
                            </div>
                            {!isUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-orange-100"
                                onClick={handleCopy}
                              >
                                {isCopied ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                          </div>
                        </CardHeader>

                        {/* ------------ Content ------------- */}
                        <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4 space-y-4">
                          {/* text */}
                          {textParts.map((p, pIdx) => (
                            <div key={`txt-${pIdx}`} className="prose prose-sm max-w-none dark:prose-invert">
                              <MemoizedMarkdown
                                content={p.text}
                                id={`${isUser ? "user" : "assistant"}-text-${m.id}-${pIdx}`}
                              />
                            </div>
                          ))}

                          {/* reasoning */}
                          {!isUser &&
                            reasoningParts.map((p, rIdx) => (
                              <ReasoningContent key={`rsn-${rIdx}`} details={p.details} messageId={m.id} />
                            ))}

                          {/* sources */}
                          {!isUser && sourceParts.length > 0 && (
                            <div className="mt-2 p-3 bg-orange-50 rounded border border-orange-200">
                              <SourceView sources={sourceParts.map((s) => s.source)} />
                            </div>
                          )}

                          {/* attachments */}
                          {isUser && m.experimental_attachments && m.experimental_attachments.length > 0 && (
                            <div className="border-t pt-3 space-y-2">
                              {m.experimental_attachments.map((att, aIdx) => (
                                <div
                                  key={`att-${aIdx}`}
                                  className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200"
                                >
                                  <FileIcon className="h-4 w-4 text-orange-600" />
                                  <Link
                                    href={`?file=${att.name}`}
                                    className="text-sm truncate hover:underline text-orange-600"
                                  >
                                    {att.name}
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* tools */}
                          {hasTools && (
                            <Accordion
                              type="single"
                              collapsible
                              defaultValue="tools"
                              className="border bg-orange-50 border-orange-200 rounded-lg"
                            >
                              <AccordionItem value="tools" className="border-0">
                                <AccordionTrigger className="px-3 sm:px-4 py-2 text-sm font-medium">
                                  <Activity className="h-4 w-4 text-orange-600 mr-2" />
                                  Medical Research Tools Used
                                </AccordionTrigger>
                                <AccordionContent className="px-3 sm:px-4 pb-4 space-y-4">
                                  {toolInvocationParts.map((part) => {
                                    const { toolName, toolCallId } = part.toolInvocation;
                                    switch (toolName) {
                                      case "searchUserDocument":
                                        return (
                                          <DocumentSearchTool key={toolCallId} toolInvocation={part.toolInvocation} />
                                        );
                                      case "websiteSearchTool":
                                        return (
                                          <WebsiteSearchTool key={toolCallId} toolInvocation={part.toolInvocation} />
                                        );
                                      default:
                                        return null;
                                    }
                                  })}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
                <ChatScrollAnchor trackVisibility={status === "streaming"} status={status} />
              </ul>
            )}
          </div>

          {/* ------------------------- MESSAGE INPUT ------------------------- */}
          <div className="sticky bottom-0 mt-auto max-w-[720px] mx-auto w-full z-5 pb-2">
            <MessageInput
              chatId={chatId}
              apiEndpoint={apiEndpoint}
              currentChat={messages}
              option={optimisticOption}
              currentChatId={currentChatId}
              modelType={optimisticModelType}
              selectedOption={optimisticOption}
              handleModelTypeChange={handleModelTypeChange}
              handleOptionChange={handleOptionChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatComponent;

