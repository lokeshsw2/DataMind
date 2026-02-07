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
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload CSV or Excel",
    description:
      "Drag and drop .csv, .xlsx, or .xls files. Parsed instantly in your browser.",
    accent: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: MessageSquare,
    title: "Chat with Your Data",
    description:
      "Ask questions in natural language. The AI understands your columns and rows.",
    accent: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Auto-Generate Charts",
    description:
      "Bar, line, and pie charts generated from your data automatically.",
    accent: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Table,
    title: "Query & Filter",
    description:
      "Filter, sort, and query data with natural language or manual controls.",
    accent: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Sparkles,
    title: "Statistical Insights",
    description:
      "Mean, median, std dev, distributions, and more with a single question.",
    accent: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Filter,
    title: "AI-Controlled Filters",
    description:
      "Tell the AI to filter your data and watch the grid update in real time.",
    accent: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Lightbulb,
    title: "Smart Insights",
    description:
      "AI identifies patterns, trends, and anomalies in your dataset.",
    accent: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: FileSpreadsheet,
    title: "Live Data Preview",
    description:
      "See your full dataset in a sortable, scrollable table alongside the chat.",
    accent: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-(family-name:--font-geist-sans)">
      {/* Subtle gradient bg */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[70%] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
        <main className="max-w-3xl w-full space-y-12">
          {/* Hero */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-18 h-18 rounded-2xl bg-linear-to-br from-violet-500 via-blue-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <FileSpreadsheet className="h-9 w-9 text-white" />
              </div>
              <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                Data<span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 to-emerald-500">Mind</span>
              </h1>
              <p className="text-muted-foreground max-w-lg text-base leading-relaxed mx-auto">
                Upload your CSV or Excel file, then chat with AI to generate
                charts, summaries, and deep insights from your data.
              </p>
            </div>

            {/* Powered by badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs text-muted-foreground">
              <span>Powered by</span>
              <a
                href="https://tambo.co"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-violet-500 transition-colors"
              >
                Tambo AI
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 w-full max-w-md text-center space-y-5">
              <ApiKeyCheck>
                <div className="space-y-4">
                  <a
                    href="/chat"
                    className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-base bg-linear-to-r from-violet-500 via-blue-500 to-emerald-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Start Analyzing
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    No sign-up required. Your data stays in your browser.
                  </p>
                </div>
              </ApiKeyCheck>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Everything you need to explore your data
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Powerful analysis tools, zero setup
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm hover:bg-card hover:border-border/80 hover:shadow-sm transition-all"
                >
                  <div
                    className={`shrink-0 w-9 h-9 rounded-lg ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`h-4 w-4 ${feature.accent}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 pt-4 text-xs text-muted-foreground">
            <a
              href="https://docs.tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md hover:text-foreground hover:bg-muted transition-colors"
            >
              Docs
            </a>
            <span className="text-border">|</span>
            <a
              href="https://tambo.co/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md hover:text-foreground hover:bg-muted transition-colors"
            >
              Dashboard
            </a>
            <span className="text-border">|</span>
            <a
              href="https://github.com/tambo-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md hover:text-foreground hover:bg-muted transition-colors"
            >
              GitHub
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
