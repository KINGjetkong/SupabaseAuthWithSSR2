'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowRight, Stethoscope, Users, Database, Shield, Zap, BookOpen, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Banner() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to chat with query
      window.location.href = `/chat?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const quickActions = [
    { title: "Drug Dosing", description: "Evidence-based dosing guidelines", icon: "💊", href: "/chat?q=drug+dosing" },
    { title: "Treatment Guidelines", description: "Latest clinical protocols", icon: "📋", href: "/chat?q=treatment+guidelines" },
    { title: "Patient Care", description: "Best practice recommendations", icon: "🏥", href: "/chat?q=patient+care" },
    { title: "Research Evidence", description: "Peer-reviewed studies", icon: "🔬", href: "/chat?q=research+evidence" }
  ]

  const features = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Multiple AI Models",
      description: "GPT-4.1, Claude 3.7, Gemini 2.5",
      status: "Active"
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Web Search Integration", 
      description: "Real-time medical literature search",
      status: "Active"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Document Chat (RAG)",
      description: "Chat with medical documents",
      status: "Active"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Vector Database",
      description: "Supabase pgvector integration",
      status: "Active"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Authentication",
      description: "HIPAA-compliant access control",
      status: "Active"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Live medical data feeds",
      status: "Active"
    }
  ]

  const stats = [
    { label: "Healthcare Users", value: "1,000+", icon: <Users className="h-5 w-5" /> },
    { label: "Medical Queries", value: "50K+", icon: <Search className="h-5 w-5" /> },
    { label: "Evidence Accuracy", value: "99.9%", icon: <CheckCircle className="h-5 w-5" /> }
  ]

  return (
    <div className="min-h-screen medical-gradient">
      {/* Header */}
      <header className="border-b border-border/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center medical-icon">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  <span className="font-serif italic">MDEvidence</span>
                  <span className="text-primary font-medium ml-1">AI</span>
                </h1>
                <p className="text-sm text-muted-foreground">AI Medical Research Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                RAG Enabled
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm">
              <Stethoscope className="h-4 w-4 mr-2" />
              AI Medical Assistant
            </Badge>
          </div>
          
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal italic text-primary mb-6 animate-fade-in">
            MDEvidence
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-12 max-w-3xl mx-auto">
            AI-powered medical guidance based on current evidence
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="medical-search rounded-xl p-4 max-w-3xl mx-auto transition-all">
              <div className="flex items-center space-x-4">
                <Search className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Ask about medical research, treatment guidelines, drug interactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button type="submit" className="medical-button px-6 py-3 rounded-lg">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="medical-card cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">{action.icon}</div>
                    <h3 className="font-semibold text-foreground text-sm mb-2">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="medical-card border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="text-primary">{stat.icon}</div>
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">
            Comprehensive Medical AI Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="medical-card transition-all hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary">{feature.icon}</div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                  <h4 className="text-foreground text-lg font-semibold mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="medical-card text-center p-8 border-primary/20">
          <CardContent className="p-0">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="text-primary text-4xl" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Experience the Future of Medical AI?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Join thousands of healthcare professionals using MDEvidence for evidence-based medical insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button className="medical-button px-8 py-4 text-lg">
                  Start Chatting Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg">
                  Check System Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <strong>Medical Disclaimer:</strong> MDEvidence provides information for educational purposes only. 
            Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment decisions.
            This AI assistant is designed to support, not replace, professional medical judgment.
          </p>
        </div>
      </main>
    </div>
  )
}


