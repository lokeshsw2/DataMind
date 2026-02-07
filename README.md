# DataMind - Chat with Your Data

> **Turn any CSV or Excel file into an interactive AI-powered analysis in seconds.**

DataMind lets you upload a spreadsheet and have a natural-language conversation with your data. Ask questions, generate charts, filter rows, compute statistics, and export polished reports - all without writing a single formula or query.

Built with **[Tambo AI](https://tambo.co)** for the [WeMakeDevs x Tambo "The UI Strikes Back" Hackathon](https://www.wemakedevs.org/hackathons/tambo/rules).

---

## Demo

> **[Live Demo](#)** | **[YouTube Demo (3 min)](#)**

<!-- Replace # with your actual deployed URL and YouTube link -->

---

## Table of Contents

- [Features at a Glance](#features-at-a-glance)
- [Tambo AI Features Used](#tambo-ai-features-used)
- [Custom Innovations Beyond the Template](#custom-innovations-beyond-the-template)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

---

## Features at a Glance

| Feature | Description |
|---|---|
| **CSV & Excel Upload** | Drag-and-drop `.csv`, `.xlsx`, `.xls`, `.xlsb` files. Parsed instantly in the browser - your data never leaves your machine. |
| **Natural Language Queries** | Ask questions like *"What region has the highest profit?"* and get instant answers with auto-generated charts and tables. |
| **AI-Generated Visualizations** | Bar, line, and pie charts rendered dynamically via Recharts based on your questions. |
| **Statistical Insights** | Mean, median, standard deviation, distributions - all computed on-the-fly with summary cards. |
| **AI-Controlled Data Filters** | Tell the AI *"Filter to Electronics in the North region"* and watch the data panel update in real time via interactable components. |
| **Multi-Format Export** | Export your entire chat analysis as Markdown, styled HTML, or a pixel-perfect PDF (capturing rendered charts). |
| **Text Selection as Context** | Select any text in the chat and add it as context for your next question. |
| **Quick Action Buttons** | One-click "Summarize Data" and "Visualize Data" buttons for instant exploration. |
| **Voice Input** | Dictate your questions using speech-to-text powered by Tambo Voice. |
| **MCP Integration** | Connect external MCP servers for additional tools and resources. |
| **Smart Suggestions** | AI-generated follow-up suggestions after every response + curated initial prompts. |
| **Resizable Split Panel** | Adjustable data preview alongside the chat for a true analytics workstation feel. |
| **Thread History** | Full conversation history with search, so you never lose an insight. |
| **Dark Mode** | Beautiful dark mode UI with Tailwind CSS v4. |

---

## Tambo AI Features Used

This project leverages **every major feature** of the Tambo AI React SDK:

### 1. Generative Components (5 Registered)

AI dynamically renders rich React components in chat responses based on user queries:

| Component | Purpose |
|---|---|
| `Graph` | Bar, line, and pie charts via Recharts with customizable datasets, labels, colors |
| `DataTable` | Sortable tables with column highlighting and row selection for query results |
| `SummaryStats` | Statistical summary cards (count, mean, median, min, max, stdDev) with trend indicators |
| `InsightCard` | Narrative insight cards with icons, metrics, and descriptions |
| `DataCard` | Clickable multi-select cards with links and summaries |

Each component is registered with a **Zod props schema** for type-safe AI control.

### 2. Local Tools (5 Registered)

AI autonomously calls these client-side tools to analyze uploaded data:

| Tool | What It Does |
|---|---|
| `getColumnStats` | Statistical summary (min, max, mean, median, stdDev) for any numeric column |
| `queryData` | Filter, sort, and paginate rows with 7 operators (equals, contains, gt, lt, gte, lte, notEquals) |
| `getDataSample` | Preview rows with automatic column type inference |
| `getColumnValues` | Unique value counts and percentages for categorical columns |
| `aggregateData` | Group-by aggregation (sum, avg, count, min, max) for chart-ready data |

### 3. Interactable Components (`withInteractable`)

The **Data Filter Panel** uses `withInteractable` so the AI can programmatically add, modify, and clear filters on the data grid - true bidirectional AI-UI interaction. Users can also manually adjust filters, and the AI sees the changes.

### 4. Context Helpers

A custom `csvContextHelper` injects CSV metadata (column names, types, row count, sample data) into every AI message, giving the model full awareness of the uploaded dataset without re-uploading.

### 5. Streaming Responses

All AI responses stream in real time using `streamResponse: true` with `streamdown` for progressive markdown rendering, so users see results as they're generated.

### 6. Context Attachments (`useTamboContextAttachment`)

Users can **select text from the chat and attach it as context** for their next message. Context badges appear above the input, auto-clear on submission, and are rendered as styled quotes in the user's message bubble.

### 7. Voice Input (`useTamboVoice`)

Built-in **speech-to-text dictation** via the `DictationButton` component, allowing hands-free data exploration.

### 8. MCP Integration (Model Context Protocol)

Full MCP support with:
- **`McpConfigModal`** - Client-side MCP server management with HTTP/SSE transport
- **`useTamboMcpResourceList`** - Browse and insert MCP resources via @ mentions
- **`useTamboMcpPromptList`** / **`useTamboMcpPrompt`** - Use MCP prompts via / commands
- **MCP Elicitation UI** (`useTamboMcpElicitationContext`) - Handle interactive MCP requests
- Cross-tab localStorage sync for server configuration

### 9. AI Suggestions (`useTamboSuggestions`)

- Intelligent **follow-up suggestions** generated after every AI response
- Keyboard shortcuts (Cmd/Ctrl+Alt+1-3) for quick acceptance
- **Curated initial suggestions** when the chat is empty (Show data overview, Filter data, Find top performers, Data quality check)

### 10. Thread Management (`useTamboThread`)

- Full **conversation history** with sidebar, search, and new thread creation
- Message state tracking, cancel support, and idle detection
- Session-persisted draft messages

### 11. Rich Text Input (`useTamboThreadInput`)

- **TipTap-based editor** with @ mentions for MCP resources and / commands for MCP prompts
- Image support (drag-and-drop, paste, file picker)
- Draft persistence across sessions via sessionStorage

### 12. TamboProvider

Wraps the entire app with centralized configuration: API key, registered components, tools, MCP servers, and context helpers.

---

## Custom Innovations Beyond the Template

These features are **original work** built on top of the Tambo template:

### Client-Side Spreadsheet Engine
- Full CSV and Excel parser (PapaParse + SheetJS) running entirely in the browser
- Automatic column type inference (string, number, date)
- Module-level data reference so Tambo tools can access data outside the React tree

### AI-Controlled Data Filtering
- Interactable filter panel where the AI can programmatically set filters
- 7 filter operators with real-time data grid updates
- Users and AI can both control filters bidirectionally

### Resizable Analytics Workspace
- Draggable split-panel layout with data preview on the left and chat on the right
- Configurable min/max/default widths for the perfect workstation layout

### Multi-Format Export System
- **Markdown** export with timestamps and message attribution
- **Styled HTML** report with message bubbles and full formatting
- **PDF export** using `html2canvas-pro` + `jsPDF` that captures rendered React components (charts, tables, insight cards) as pixel-perfect multi-page documents

### Text Selection Context System
- Toolbar button to capture selected text from the chat
- Visual context badges above the input with remove capability
- Auto-clear on message submission
- Quoted context rendered as styled blockquotes in user message bubbles

### Quick Action Buttons
- "Summarize Data" - one-click comprehensive data overview
- "Visualize Data" - one-click chart generation
- Custom `useAutoSubmit` hook for reusable auto-send button logic

### Smart Initial Suggestions
- Curated data-focused prompts shown only when the thread is empty
- Icons and descriptions to guide first-time users

### Live Data Preview Table
- Sortable columns with type-aware icons
- Filter-aware display showing matched rows
- Collapsible column info panel
- Performance-optimized for datasets up to 500 rows

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    TamboProvider                      │  │
│  │  (API Key, Components, Tools, MCP, Context Helpers)   │  │
│  │  ┌─────────────────┐  ┌────────────────────────────┐  │  │
│  │  │  Data Panel      │  │     Chat Panel             │  │  │
│  │  │  ┌─────────────┐ │  │  ┌──────────────────────┐  │  │  │
│  │  │  │ CSV Upload   │ │  │  │ Thread History       │  │  │  │
│  │  │  │ Data Preview │ │  │  │ Message Stream       │  │  │  │
│  │  │  │ Filter Panel │ │◄─┤  │ Generative Components│  │  │  │
│  │  │  │ (Interactable│ │  │  │ (Graph, Table, Stats)│  │  │  │
│  │  │  └─────────────┘ │  │  │ AI Suggestions       │  │  │  │
│  │  │                   │  │  │ Context Attachments   │  │  │  │
│  │  │                   │  │  │ Export (MD/HTML/PDF)  │  │  │  │
│  │  │                   │  │  └──────────────────────┘  │  │  │
│  │  └─────────────────┘  └────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│            ┌─────────────────┼─────────────────┐            │
│            ▼                 ▼                  ▼            │
│     ┌────────────┐  ┌──────────────┐  ┌──────────────┐     │
│     │ CSV Tools  │  │ Tambo AI API │  │ MCP Servers  │     │
│     │ (client)   │  │ (streaming)  │  │ (optional)   │     │
│     └────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **100% client-side data processing** - Your data never leaves the browser
- **Streaming-first** - All AI responses stream progressively for instant feedback
- **Bidirectional AI-UI** - AI can control UI components AND users can interact manually
- **Context-aware AI** - CSV metadata injected via context helpers on every message

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, TypeScript 5 |
| **AI SDK** | Tambo AI React (`@tambo-ai/react` ^0.74.1) |
| **Styling** | Tailwind CSS v4, Radix UI, Framer Motion |
| **Rich Text** | TipTap Editor with MCP extensions |
| **Charts** | Recharts 3 |
| **Data Parsing** | PapaParse (CSV), SheetJS (Excel) |
| **PDF Export** | html2canvas-pro + jsPDF |
| **Markdown** | react-markdown + streamdown (streaming) |
| **Code Highlighting** | highlight.js |
| **Validation** | Zod |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Tambo AI API key](https://tambo.co/dashboard)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/chat-with-csv-tambo.git
cd chat-with-csv-tambo

# Install dependencies
npm install

# Set up environment variables
cp example.env.local .env.local
# Add your Tambo API key to .env.local:
# NEXT_PUBLIC_TAMBO_API_KEY=your_key_here

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start analyzing your data.

### Usage

1. **Upload** - Drag and drop a CSV or Excel file on the landing page
2. **Ask** - Type a question like *"Show me revenue by region as a bar chart"*
3. **Explore** - Use quick action buttons, voice input, or follow AI suggestions
4. **Filter** - Ask the AI to filter data or use the manual filter panel
5. **Export** - Download your analysis as Markdown, HTML, or PDF

---

## Project Structure

```
src/
├── app/
│   ├── chat/page.tsx              # Main split-panel analytics workspace
│   ├── layout.tsx                 # Root layout with metadata
│   └── page.tsx                   # Landing page with feature showcase
│
├── components/
│   ├── csv-upload.tsx             # Drag-and-drop file upload
│   ├── csv-preview.tsx            # Sortable data preview table
│   ├── export-chat.tsx            # Multi-format export (MD/HTML/PDF)
│   ├── resize-handle.tsx          # Draggable panel divider
│   │
│   ├── tambo/                     # Tambo-powered components
│   │   ├── graph.tsx              # Recharts visualization (registered)
│   │   ├── data-table.tsx         # Query result tables (registered)
│   │   ├── summary-stats.tsx      # Statistical cards (registered)
│   │   ├── insight-card.tsx       # Narrative insight cards (registered)
│   │   ├── data-filter-panel.tsx  # Interactable AI-controlled filters
│   │   ├── quick-action-buttons.tsx  # Summarize/Visualize buttons
│   │   ├── selection-context.tsx  # Text selection context system
│   │   ├── message-thread-full.tsx   # Full chat UI orchestration
│   │   ├── message-input.tsx      # Rich TipTap editor with MCP
│   │   ├── dictation-button.tsx   # Voice-to-text input
│   │   ├── mcp-components.tsx     # MCP prompt/resource buttons
│   │   ├── mcp-config-modal.tsx   # MCP server management
│   │   └── message-suggestions.tsx   # AI follow-up suggestions
│   │
│   └── ui/
│       └── card-data.tsx          # DataCard component (registered)
│
├── lib/
│   ├── tambo.ts                   # Central component & tool registration
│   ├── csv-context.tsx            # CSV data provider & context helpers
│   └── thread-hooks.ts           # Custom thread utilities
│
└── services/
    └── csv-tools.ts               # 5 AI-callable data analysis tools
```

---

## Screenshots

<!-- Add screenshots of your app here -->

| Landing Page | Chat with Data |
|---|---|
| ![Landing Page](#) | ![Chat Interface](#) |

| Chart Generation | PDF Export |
|---|---|
| ![Charts](#) | ![PDF Export](#) |

<!-- Replace # with actual screenshot paths -->

---

## Tambo Feature Coverage Summary

| Tambo Feature | Used | Details |
|---|---|---|
| Generative Components | Yes | 5 registered (Graph, DataTable, SummaryStats, InsightCard, DataCard) |
| Local Tools | Yes | 5 CSV analysis tools with Zod schemas |
| Interactable Components (`withInteractable`) | Yes | AI-controlled Data Filter Panel |
| Streaming Responses | Yes | Real-time streaming with streamdown |
| Context Helpers | Yes | CSV metadata injected on every message |
| Context Attachments | Yes | Text selection capture with badges |
| Voice Input (`useTamboVoice`) | Yes | Speech-to-text dictation button |
| MCP Integration | Yes | Server config, prompts, resources, elicitation |
| AI Suggestions (`useTamboSuggestions`) | Yes | Follow-up suggestions + initial prompts |
| Thread Management | Yes | History, search, persistence |
| Rich Text Input (TipTap) | Yes | @ mentions, / commands, images |
| TamboProvider | Yes | Full configuration with all features |

---

## Why DataMind?

- **Privacy-first**: All data processing happens in your browser. Nothing is uploaded to any server.
- **Zero learning curve**: Just upload and ask. No SQL, no formulas, no pivot tables.
- **Full Tambo integration**: Showcases every major Tambo AI feature working together in a real, useful application.
- **Production-quality UX**: Resizable panels, streaming responses, voice input, keyboard shortcuts, dark mode, and polished export options.
- **Practical utility**: This isn't a demo - it's a tool people would actually use to analyze their spreadsheets.

---

## License

MIT

---

<p align="center">
  Built with <a href="https://tambo.co">Tambo AI</a> for the <a href="https://www.wemakedevs.org/hackathons/tambo/rules">WeMakeDevs x Tambo Hackathon</a>
</p>
