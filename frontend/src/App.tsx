import { ChangeEvent, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderOpen,
  MessageSquareText,
  Plus,
  Search,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";

type View = "search" | "chat" | "sources";

const sourceFiles = [
  { name: "Product handbook.pdf", meta: "PDF · 12 pages", color: "peach" },
  { name: "Research notes.md", meta: "Markdown · 4.2 KB", color: "mint" },
  { name: "Q4 planning.docx", meta: "Word document · 8 pages", color: "lavender" },
];

function App() {
  const [view, setView] = useState<View>("search");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [uploaded, setUploaded] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setUploaded((current) => [...current, ...files.map((file) => file.name)]);
  };

  const submitQuery = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setView("chat");
    setMessage(query.trim());
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></div>
          <span>know<span className="brand-accent">ledge</span></span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="collection-button"><BookOpen size={17} /> Product knowledge <ChevronRight size={15} /></button>
        <nav className="nav-list" aria-label="Workspace navigation">
          <button className={view === "search" ? "nav-item active" : "nav-item"} onClick={() => setView("search")}><Search size={18} /> Explore</button>
          <button className={view === "chat" ? "nav-item active" : "nav-item"} onClick={() => setView("chat")}><MessageSquareText size={18} /> Conversation</button>
          <button className={view === "sources" ? "nav-item active" : "nav-item"} onClick={() => setView("sources")}><FolderOpen size={18} /> Sources <span className="count">{sourceFiles.length + uploaded.length}</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="index-status"><span className="status-dot" /> Index up to date <CheckCircle2 size={15} /></div>
          <div className="profile"><div className="avatar">AR</div><div><strong>Arijit</strong><small>Local workspace</small></div><ChevronRight size={15} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><span className="breadcrumb">Product knowledge <ChevronRight size={14} /> <strong>{view === "sources" ? "Sources" : view === "chat" ? "Conversation" : "Explore"}</strong></span><button className="icon-button" title="Add source" onClick={() => fileInput.current?.click()}><Plus size={19} /></button></header>
        <input ref={fileInput} type="file" multiple hidden onChange={handleUpload} />

        {view === "search" && <section className="landing-view">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR KNOWLEDGE, IN CONTEXT</div>
          <h1>Ask better<br /><em>questions.</em></h1>
          <p className="intro">Search across your documents and get clear, cited answers grounded in the knowledge you trust.</p>
          <form className="search-box" onSubmit={submitQuery}><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What would you like to understand?" aria-label="Search your knowledge" /><button type="submit"><Send size={17} /></button></form>
          <div className="prompt-row"><span>Try asking</span><button onClick={() => setQuery("What are the key product principles?")}>What are the key product principles?</button><button onClick={() => setQuery("Summarize the latest research")}>Summarize the latest research</button></div>
          <div className="stat-strip"><div><strong>{sourceFiles.length + uploaded.length}</strong><span>sources indexed</span></div><div><strong>—</strong><span>answers so far</span></div><div><strong>Local</strong><span>private by default</span></div></div>
        </section>}

        {view === "chat" && <section className="conversation-view"><div className="conversation-heading"><div className="eyebrow"><span className="eyebrow-line" /> CONVERSATION</div><h2>{message || "Your knowledge, in conversation."}</h2><p>Grounded answers will appear here with the sources that support them.</p></div><div className="answer-placeholder"><Sparkles size={20} /><div><strong>Ready when you are.</strong><p>Connect the retrieval pipeline to turn your sources into cited answers.</p></div></div><form className="search-box compact" onSubmit={submitQuery}><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask a follow-up question..." aria-label="Ask a follow-up" /><button type="submit"><Send size={17} /></button></form></section>}

        {view === "sources" && <section className="sources-view"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> KNOWLEDGE BASE</div><h2>Your sources</h2><p>Documents that give your workspace its memory.</p></div><button className="upload-button" onClick={() => fileInput.current?.click()}><Upload size={17} /> Add sources</button></div><div className="source-grid">{sourceFiles.map((file) => <div className="source-card" key={file.name}><div className={`file-icon ${file.color}`}><FileText size={21} /></div><strong>{file.name}</strong><span>{file.meta}</span><div className="indexed"><CheckCircle2 size={14} /> Indexed</div></div>)}{uploaded.map((name) => <div className="source-card" key={name}><div className="file-icon mint"><FileText size={21} /></div><strong>{name}</strong><span>New upload</span><div className="indexed"><CheckCircle2 size={14} /> Queued</div></div>)}<button className="drop-card" onClick={() => fileInput.current?.click()}><Upload size={21} /><strong>Drop files here</strong><span>PDF, DOCX, MD, TXT</span></button></div></section>}
      </main>
    </div>
  );
}

export default App;
