"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle, Terminal } from "lucide-react";

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const CopyButton = ({ text }: { text: string }) => {
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Copy to clipboard"
    >
      {showCopied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

const ApiKeyMissingAlert = () => (
  <div className="space-y-3">
    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="space-y-2 text-sm">
        <p className="text-foreground font-medium">
          Tambo is not initialized yet
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Run the following command to set up your API key:
        </p>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 font-mono text-xs">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <code className="grow text-foreground">npx tambo init</code>
          <CopyButton text="npx tambo init" />
        </div>
        <p className="text-muted-foreground text-xs">
          Or visit{" "}
          <a
            href="https://tambo.co/cli-auth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium"
          >
            tambo.co/cli-auth
          </a>{" "}
          to get your API key and add it to{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
            .env.local
          </code>
        </p>
      </div>
    </div>
  </div>
);

export function ApiKeyCheck({ children }: ApiKeyCheckProps) {
  const isApiKeyMissing = !process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (isApiKeyMissing) {
    return <ApiKeyMissingAlert />;
  }

  return <>{children}</>;
}
