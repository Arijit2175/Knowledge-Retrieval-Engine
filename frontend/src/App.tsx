import { ChangeEvent, useEffect, useRef, useState } from "react";
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
type SearchResult = { content: string; source: string };

function App() {
  const [view, setView] = useState<View>("search");
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [message, setMessage] = useState("");
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatCitations, setChatCitations] = useState<string[]>([]);
  const [chatting, setChatting] = useState(false);
  const [chatError, setChatError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/documents")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load sources");
        return response.json() as Promise<{ documents: { filename: string }[] }>;
      })
      .then((data) => setUploaded(data.documents.map((document) => document.filename)))
      .catch(() => setUploadError("Could not load indexed sources"));
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setUploadError("");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("http://localhost:8000/api/documents", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }
        setUploaded((current) => [...current, file.name]);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const submitQuery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setView("chat");
    setMessage(query.trim());
    setChatting(true);
    setChatError("");
    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), source: selectedSource || null }),
      });
      if (!response.ok) throw new Error("Conversation request failed");
      const data = (await response.json()) as { answer: string; citations: string[] };
      setChatAnswer(data.answer);
      setChatCitations(data.citations);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Conversation request failed");
      setChatAnswer("");
      setChatCitations([]);
    } finally {
      setChatting(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearchError("");
    try {
      const response = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), source: selectedSource || null }),
      });
      if (!response.ok) throw new Error("Search request failed");
      const data = (await response.json()) as { results: SearchResult[] };
      setResults(data.results);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Search request failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
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
          <button className={view === "sources" ? "nav-item active" : "nav-item"} onClick={() => setView("sources")}><FolderOpen size={18} /> Sources <span className="count">{uploaded.length}</span></button>
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
          <form className="search-box" onSubmit={handleSearch}><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What would you like to understand?" aria-label="Search your knowledge" /><select className="source-filter" value={selectedSource} onChange={(event) => setSelectedSource(event.target.value)} aria-label="Limit search to a source"><option value="">All sources</option>{uploaded.map((source) => <option value={source} key={source}>{source}</option>)}</select><button type="submit" disabled={searching}><Send size={17} /></button></form>
          <div className="prompt-row"><span>Try asking</span><button onClick={() => setQuery("What are the key product principles?")}>What are the key product principles?</button><button onClick={() => setQuery("Summarize the latest research")}>Summarize the latest research</button></div>
          {searching && <p className="search-status">Searching your indexed sources...</p>}
          {searchError && <p className="search-status">{searchError}</p>}
          {results.length > 0 && <div className="results-list"><div className="results-heading">RETRIEVED CONTEXT <span>{results.length} matches</span></div>{results.map((result, index) => <article className="result-item" key={`${result.source}-${index}`}><div className="result-source"><FileText size={14} /> {result.source}</div><p>{result.content}</p></article>)}</div>}
          <div className="stat-strip"><div><strong>{uploaded.length}</strong><span>sources indexed</span></div><div><strong>—</strong><span>answers so far</span></div><div><strong>Local</strong><span>private by default</span></div></div>
        </section>}

        {view === "chat" && <section className="conversation-view"><div className="conversation-heading"><div className="eyebrow"><span className="eyebrow-line" /> CONVERSATION</div><h2>{message || "Your knowledge, in conversation."}</h2><p>Grounded answers will appear here with the sources that support them.</p></div>{chatting && <div className="answer-placeholder"><Sparkles size={20} /><div><strong>Retrieving context...</strong><p>Searching the selected sources.</p></div></div>}{chatError && <p className="search-status">{chatError}</p>}{chatAnswer && <div className="answer-placeholder"><Sparkles size={20} /><div><strong>{chatAnswer}</strong>{chatCitations.length > 0 && <p>Citations: {chatCitations.join(", ")}</p>}</div></div>}<form className="search-box compact" onSubmit={submitQuery}><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask a follow-up question..." aria-label="Ask a follow-up" /><button type="submit" disabled={chatting}><Send size={17} /></button></form></section>}

        {view === "sources" && <section className="sources-view"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> KNOWLEDGE BASE</div><h2>Your sources</h2><p>Documents that give your workspace its memory.</p>{uploading && <p>Indexing selected files...</p>}{uploadError && <p>{uploadError}</p>}</div><button className="upload-button" onClick={() => fileInput.current?.click()} disabled={uploading}><Upload size={17} /> {uploading ? "Indexing..." : "Add sources"}</button></div><div className="source-grid">{uploaded.map((name) => <button className="source-card" key={name} type="button" onClick={() => { setSelectedSource(name); setView("search"); }}><div className="file-icon mint"><FileText size={21} /></div><strong>{name}</strong><span>Click to search this document</span><div className="indexed"><CheckCircle2 size={14} /> Indexed</div></button>)}<button className="drop-card" onClick={() => fileInput.current?.click()}><Upload size={21} /><strong>Drop files here</strong><span>PDF, DOCX, MD, TXT</span></button></div></section>}
      </main>
    </div>
  );
}

export default App;