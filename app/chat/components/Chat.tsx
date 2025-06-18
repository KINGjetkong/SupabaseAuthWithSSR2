'use client';

import React, { useState, useOptimistic, startTransition, useEffect } from 'react';
import { useChat, type Message } from '@ai-sdk/react';
import { useParams } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { ChatScrollAnchor } from '../hooks/chat-scroll-anchor';
import { setModelSettings } from '../actions';
import Link from 'next/link';
// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MemoizedMarkdown from './tools/MemoizedMarkdown';
import ReasoningContent from './tools/Reasoning';
import SourceView from './tools/SourceView';
import DocumentSearchTool from './tools/DocumentChatTool';
import WebsiteSearchTool from './tools/WebsiteChatTool';
import MessageInput from './ChatMessageInput';
import { toast } from 'sonner';

// Icons from Lucide React
import { 
  Copy, 
  CheckCircle, 
  FileIcon, 
  Stethoscope, 
  Activity, 
  Clock,
  BookOpen,
  FileText,
  Calculator,
  Users,
  ChevronDown,
  ClipboardList,
  UserCheck,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
  Folder
} from 'lucide-react';

interface ChatProps {
  currentChat?: Message[];
  chatId: string;
  initialModelType: string;
  initialSelectedOption: string;
}

const ChatComponent: React.FC<ChatProps> = ({
  currentChat,
  chatId,
  initialModelType,
  initialSelectedOption
}) => {
  const param = useParams();
  const currentChatId = param.id as string;

  const [optimisticModelType, setOptimisticModelType] = useOptimistic<string, string>(
    initialModelType, 
    (_, newValue) => newValue
  );
  const [isCopied, setIsCopied] = useState(false);
  const [optimisticOption, setOptimisticOption] = useOptimistic<string, string>(
    initialSelectedOption,
    (_, newValue) => newValue
  );

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat-history');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleModelTypeChange = async (newValue: string) => {
    startTransition(async () => {
      setOptimisticModelType(newValue);
      await setModelSettings(newValue, optimisticOption);
    });
  };

  const handleOptionChange = async (newValue: string) => {
    startTransition(async () => {
      setOptimisticOption(newValue);
      await setModelSettings(optimisticModelType, newValue);
    });
  };

  // Determine API endpoint based on model type
  const getApiEndpoint = () => {
    switch (optimisticModelType) {
      case 'perplex':
        return '/api/perplexity';
      case 'website':
        return '/api/websitechat';
      default:
        return '/api/chat';
    }
  };

  const apiEndpoint = getApiEndpoint();

  // Get messages from chat - DECLARED BEFORE useEffect that uses it
  const { messages, status } = useChat({
    id: 'chat',
    api: apiEndpoint,
    experimental_throttle: 50,
    initialMessages: currentChat,
    onFinish: async () => {
      if (chatId === currentChatId) return;
      await mutate((key) => Array.isArray(key) && key[0] === 'chatPreviews');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    }
  });

  const { mutate } = useSWRConfig();

  // Check if mobile and handle sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Auto-open on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show chat interface when messages exist - NOW AFTER messages is declared
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages.length]);

  // Medical quick actions with intent classification
  const medicalQuickActions = [
    {
      title: "Prior Authorization",
      description: "Generate prior auth letters",
      icon: <FileText className="h-5 w-5" />,
      intent: "GENERATE_PRIOR_AUTH_LETTER",
      example: "Draft a prior authorization letter for Ozempic for Type 2 diabetes",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      title: "Clinical Calculations",
      description: "Calculate medical scores",
      icon: <Calculator className="h-5 w-5" />,
      intent: "CALCULATE_CLINICAL_SCORE",
      example: "Calculate CHA2DS2-VASc score for 72-year-old female with hypertension and diabetes",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      title: "Clinical Guidelines",
      description: "Access treatment protocols",
      icon: <ClipboardList className="h-5 w-5" />,
      intent: "EXPLAIN_CLINICAL_GUIDELINE",
      example: "What are the latest AHA/ACC guidelines for hypertension in CKD patients?",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      title: "Patient Care",
      description: "Clinical decision support",
      icon: <Users className="h-5 w-5" />,
      intent: "WRITE_PATIENT_HANDOUT",
      example: "Construct a workup for new-onset atrial fibrillation",
      color: "bg-primary/10 text-primary border-primary/20"
    }
  ];

  const handleQuickAction = (action: typeof medicalQuickActions[0]) => {
    const input = document.querySelector('textarea[placeholder*="medical"]') as HTMLTextAreaElement;
    if (input) {
      input.value = action.example;
      input.focus();
      setShowWelcome(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Recent conversations (mock data)
  const recentConversations = [
    { title: "Hypertension treatment guidelines", time: "2 hours ago" },
    { title: "Diabetes medication dosing", time: "Yesterday" },
    { title: "Antibiotic resistance patterns", time: "2 days ago" },
    { title: "Cardiac risk assessment", time: "1 week ago" }
  ];

  return (
    <div className="h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-sm h-14">
        <div className="flex items-center justify-between w-full h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-foreground">MDEvidence AI</h1>
              </div>
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
            <Link href="/chat" className="text-primary font-semibold">
              Medical Chat
            </Link>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Profile
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-64' : 'relative w-64'}
          bg-background border-r border-border transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">MDEvidence AI</h2>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            <Button className="w-full mt-3 bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Medical Chat
            </Button>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-border">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'chat-history'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('chat-history')}
            >
              Chat History
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('files')}
            >
              Files
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chat-history' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">RECENT CONVERSATIONS</h3>
                {recentConversations.map((conv, index) => (
                  <div key={index} className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">{conv.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'files' && (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No files uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showWelcome ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-primary/5 to-background">
              <div className="w-full max-w-4xl mx-auto text-center space-y-8">
                {/* Main Title */}
                <div className="space-y-4">
                  <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    AI-Powered Medical Guidance
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                    <span className="text-primary italic font-serif">MDEvidence</span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    AI-powered medical guidance based on current evidence
                  </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {medicalQuickActions.map((action, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${action.color} border`}
                      onClick={() => handleQuickAction(action)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
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
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Draft a prior authorization letter for Ozempic for Type 2 diabetes
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Calculate CHA2DS2-VASc score for 72-year-old female with hypertension and diabetes
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          What are the latest AHA/ACC guidelines for hypertension in CKD patients?
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Construct a workup for new-onset atrial fibrillation
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Trust Message */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Trusted by <span className="text-primary font-semibold">healthcare professionals</span> worldwide for evidence-based medical guidance
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto">
                <ul className="flex-1 w-full mx-auto max-w-[1000px] px-4 py-4">
                  {messages.map((message, index) => {
                    const isUserMessage = message.role === 'user';
                    const copyToClipboard = (str: string) => {
                      window.navigator.clipboard.writeText(str);
                    };
                    const handleCopy = (content: string) => {
                      copyToClipboard(content);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 1000);
                    };

                    // Filter tool invocation parts
                    const toolInvocationParts = !isUserMessage
                      ? message.parts?.filter((part) => part.type === 'tool-invocation') || []
                      : [];

                    const hasToolInvocations = toolInvocationParts.length > 0;

                    // Group parts by type
                    const textParts = message.parts?.filter((part) => part.type === 'text') || [];
                    const reasoningParts = message.parts?.filter((part) => part.type === 'reasoning') || [];
                    const sourceParts = message.parts?.filter((part) => part.type === 'source') || [];

                    return (
                      <li key={`${message.id}-${index}`} className="my-4">
                        <Card className={`transition-all hover:shadow-lg ${
                          isUserMessage
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-card border-border/50'
                        }`}>
                          <CardHeader className="pb-2 px-4">
                            <div className="flex items-center gap-3">
                              {isUserMessage ? (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                                  <UserCheck className="h-5 w-5 text-white" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                                  <Stethoscope className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-sm">
                                    {isUserMessage ? 'Healthcare Professional' : 'MDEvidence AI'}
                                  </h3>
                                  {!isUserMessage && (
                                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                                      Evidence-Based
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {message.createdAt
                                    ? new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      })
                                    : new Date().toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      })}
                                </p>
                              </div>
                              {!isUserMessage && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-primary/10"
                                  onClick={() => handleCopy(message.content)}
                                >
                                  {isCopied ? (
                                    <CheckCircle size={16} className="text-green-600" />
                                  ) : (
                                    <Copy size={16} className="text-muted-foreground" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="py-0 px-4">
                            {/* Render text parts */}
                            {textParts.map((part, partIndex) => (
                              <div key={`text-${partIndex}`} className="prose prose-sm max-w-none dark:prose-invert">
                                <MemoizedMarkdown
                                  content={part.text}
                                  id={`${isUserMessage ? 'user' : 'assistant'}-text-${message.id}-${partIndex}`}
                                />
                              </div>
                            ))}

                            {/* Render reasoning parts */}
                            {!isUserMessage && reasoningParts.map((part, partIndex) => (
                              <div key={`reasoning-${partIndex}`} className="mt-4">
                                <ReasoningContent details={part.details} messageId={message.id} />
                              </div>
                            ))}

                            {/* Render source parts */}
                            {!isUserMessage && sourceParts.length > 0 && (
                              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-2 mb-3">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-semibold text-primary">Medical Sources</span>
                                </div>
                                <SourceView sources={sourceParts.map((part) => part.source)} />
                              </div>
                            )}

                            {/* Display attached files */}
                            {isUserMessage && message.experimental_attachments && message.experimental_attachments.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-primary/20">
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <FileIcon className="h-4 w-4 text-primary" />
                                  Medical Documents:
                                </h4>
                                <div className="space-y-2">
                                  {message.experimental_attachments.map((attachment, idx) => (
                                    <div key={`attachment-${idx}`} className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                      <FileIcon className="h-4 w-4 text-primary" />
                                      <Link className="font-medium text-primary hover:underline flex-1" href={`?file=${attachment.name}`}>
                                        {attachment.name}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Render tool invocations */}
                            {hasToolInvocations && (
                              <div className="mt-6">
                                <Accordion type="single" defaultValue="tool-invocation" collapsible className="w-full border border-primary/20 rounded-lg bg-primary/5">
                                  <AccordionItem value="tool-invocation" className="border-0">
                                    <AccordionTrigger className="px-4 py-3 font-medium hover:no-underline">
                                      <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <span className="text-primary">Medical Research Tools Used</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                      <div className="space-y-4">
                                        {toolInvocationParts.map((part) => {
                                          const toolName = part.toolInvocation.toolName;
                                          const toolId = part.toolInvocation.toolCallId;
                                          switch (toolName) {
                                            case 'searchUserDocument':
                                              return <DocumentSearchTool key={toolId} toolInvocation={part.toolInvocation} />;
                                            case 'websiteSearchTool':
                                              return <WebsiteSearchTool key={toolId} toolInvocation={part.toolInvocation} />;
                                            default:
                                              return null;
                                          }
                                        })}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                  <ChatScrollAnchor trackVisibility={status === 'streaming'} status={status} />
                </ul>
              </div>
            </div>
          )}

          {/* Input Area */}
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

export default ChatComponent;

