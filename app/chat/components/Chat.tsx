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

// Medical icons - enhanced for healthcare
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
  FileText,
  Calculator,
  ClipboardList,
  Users,
  BookOpen,
  Plus,
  ChevronDown,
} from "lucide-react";

interface ChatProps {
  currentChat?: Message[];
  chatId: string;
  initialModelType: string;
  initialSelectedOption: string;
}

/* -------------------------------------------------------------------------- */
/*                    MEDICAL AI CHAT - ENHANCED STYLING                     */
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
  const [showWelcome, setShowWelcome] = useState(true);

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

  // Hide welcome when messages exist
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages.length]);

  /* --------------------------- THEME TOGGLER --------------------------- */
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  /* ------------------------- MEDICAL QUICK ACTIONS ------------------------- */
  const medicalQuickActions = [
    {
      title: "Prior Authorization",
      description: "Generate prior auth letters",
      icon: <FileText className="h-5 w-5" />,
      example: "Draft a prior authorization letter for Ozempic for Type 2 diabetes",
      color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
    },
    {
      title: "Clinical Calculations",
      description: "Calculate medical scores",
      icon: <Calculator className="h-5 w-5" />,
      example: "Calculate CHA2DS2-VASc score for 72-year-old female with hypertension and diabetes",
      color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
    },
    {
      title: "Clinical Guidelines",
      description: "Access treatment protocols",
      icon: <ClipboardList className="h-5 w-5" />,
      example: "What are the latest AHA/ACC guidelines for hypertension in CKD patients?",
      color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
    },
    {
      title: "Patient Care",
      description: "Clinical decision support",
      icon: <Users className="h-5 w-5" />,
      example: "Construct a workup for new-onset atrial fibrillation",
      color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
    }
  ];

  const handleQuickAction = (action: typeof medicalQuickActions[0]) => {
    setShowWelcome(false);
    // Focus the input after a short delay
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea && textarea instanceof HTMLTextAreaElement) {
        textarea.value = action.example;
        textarea.focus();
      }
    }, 100);
  };

  /* ---------------------------------------------------------------------- */
  /*                               RENDERING                               */
  /* ---------------------------------------------------------------------- */

  /* ------------------------------ SIDEBAR ------------------------------ */
  const SidebarContent = () => (
    <div className="flex flex-col h-full w-64 bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">MDEvidence AI</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Medical Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">RECENT CONVERSATIONS</h3>
        
        {/* Mock medical conversations */}
        {[
          { title: "Hypertension treatment guidelines", time: "2 hours ago" },
          { title: "Diabetes medication dosing", time: "Yesterday" },
          { title: "Antibiotic resistance patterns", time: "2 days ago" },
          { title: "Cardiac risk assessment", time: "1 week ago" }
        ].map((conv, index) => (
          <div key={index} className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground">{conv.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ----------------------------- MAIN JSX ----------------------------- */
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* ---------------------------- MEDICAL HEADER ---------------------------- */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/evidence" className="text-muted-foreground hover:text-foreground transition-colors">
              Evidence Search
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/chat" className="text-orange-600 font-semibold">
              Medical Chat
            </Link>
          </div>

          {/* right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Profile
              <ChevronDown className="ml-1 h-4 w-4" />
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
              /* Medical Welcome Screen */
              <div className="flex flex-col items-center justify-center h-full px-4 py-8 bg-gradient-to-b from-orange-50/50 to-background">
                <div className="w-full max-w-4xl mx-auto text-center space-y-8">
                  {/* Medical Title */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-3 py-1 bg-orange-100 rounded-full text-orange-700 text-sm font-medium">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      AI-Powered Medical Guidance
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                      <span className="text-orange-600 italic font-serif">MDEvidence</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      AI-powered medical guidance based on current evidence
                    </p>
                  </div>

                  {/* Medical Quick Actions Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {medicalQuickActions.map((action, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${action.color} border`}
                        onClick={() => handleQuickAction(action)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            {action.icon}
                          </div>
                          <h3 className="font-semibold text-sm mb-2">{action.title}</h3>
                          <p className="text-xs opacity-80">{action.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Example Prompts */}
                  <div className="space-y-4 max-w-3xl mx-auto">
                    <h3 className="text-lg font-semibold text-foreground">Try these examples:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medicalQuickActions.map((action, index) => (
                        <Card 
                          key={index}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleQuickAction(action)}
                        >
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                              {action.example}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Trust Message */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Trusted by <span className="text-orange-600 font-semibold">healthcare professionals</span> worldwide for evidence-based medical guidance
                    </p>
                  </div>
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
                              <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-semibold text-orange-700">Medical Sources</span>
                              </div>
                              <SourceView sources={sourceParts.map((s) => s.source)} />
                            </div>
                          )}

                          {/* attachments */}
                          {isUser && m.experimental_attachments && m.experimental_attachments.length > 0 && (
                            <div className="border-t pt-3 space-y-2">
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <FileIcon className="h-4 w-4 text-orange-600" />
                                Medical Documents:
                              </h4>
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
                                  <span className="text-orange-700">Medical Research Tools Used</span>
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

