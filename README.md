# Knowledge Retrieval Engine

A local-first RAG workspace for searching documents, asking questions, and returning answers with citations. The repository is split into a Vite React frontend and a FastAPI backend so ingestion, retrieval, reranking, context building, and the local LLM can be added as independent stages.

## Project structure

```text
frontend/   React + Vite workspace UI
backend/    FastAPI API and future document/query pipelines
```

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The initial UI includes Explore, Conversation, and Sources views. The API currently provides `/api/health`, `/api/documents`, `/api/search`, and `/api/chat` as stable starting contracts for the retrieval engine.

## Retrieval layer

The backend uses LangChain `Document` and `BaseRetriever` primitives. The current implementation is an in-memory keyword retriever so the API can be exercised without a paid model or hosted service. The next retrieval step is to replace it with a LangChain embedding model and vector store, then add chunking through `langchain-text-splitters`.
