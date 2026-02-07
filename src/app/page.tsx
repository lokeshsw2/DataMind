import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import {
  FileSpreadsheet,
  BarChart3,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Upload,
  Table,
  Filter,
  Lightbulb,
} from "lucide-react";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <Icon className="h-4.5 w-4.5 text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-(family-name:--font-geist-sans)">
      <main className="max-w-2xl w-full px-6 py-12 space-y-8">
        {/* Hero */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            CSV Insight Chat
          </h1>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Upload your CSV or Excel file and chat with AI to generate insights,
            charts, and summaries from your data. Powered by{" "}
            <a
              href="https://tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-medium"
            >
              Tambo AI
            </a>
            .
          </p>
        </div>

        {/* API Key Check & CTA */}
        <div className="rounded-xl border border-border bg-card p-6">
          <ApiKeyCheck>
            <div className="flex flex-col items-center gap-4">
              <a
                href="/chat"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-base bg-linear-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                Start Analyzing
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-muted-foreground">
                Upload a CSV and start chatting with your data
              </p>
            </div>
          </ApiKeyCheck>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            What you can do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FeatureCard
              icon={Upload}
              title="Upload CSV or Excel"
              description="Drag and drop .csv, .xlsx, or .xls files. Data is parsed instantly in your browser."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Chat with Your Data"
              description="Ask questions in natural language. AI understands your columns and rows."
            />
            <FeatureCard
              icon={BarChart3}
              title="Auto-Generate Charts"
              description="Bar charts, line charts, pie charts -- generated from your data automatically."
            />
            <FeatureCard
              icon={Table}
              title="Query & Filter"
              description="Filter, sort, and query your data with natural language or manual controls."
            />
            <FeatureCard
              icon={Sparkles}
              title="Statistical Insights"
              description="Get mean, median, std dev, distributions, and more with a single question."
            />
            <FeatureCard
              icon={Filter}
              title="AI-Controlled Filters"
              description="Tell AI to filter your data -- it updates the filter panel in real time."
            />
            <FeatureCard
              icon={Lightbulb}
              title="Smart Insights"
              description="AI identifies patterns, trends, and anomalies in your data automatically."
            />
            <FeatureCard
              icon={FileSpreadsheet}
              title="Live Preview"
              description="See your full dataset in a sortable, scrollable table alongside the chat."
            />
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <a
            href="https://docs.tambo.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Tambo Docs
          </a>
          <span className="text-muted-foreground/30">|</span>
          <a
            href="https://tambo.co/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </a>
          <span className="text-muted-foreground/30">|</span>
          <a
            href="https://github.com/tambo-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
