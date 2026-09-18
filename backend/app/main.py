from typing import Annotated

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .services.ingestion import load_uploaded_file
from .services.retrieval import retrieval_service


app = FastAPI(title="Knowledge Retrieval Engine", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    source: str | None = None


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "knowledge-retrieval-engine"}


@app.post("/api/documents")
async def upload_document(file: Annotated[UploadFile, File()]) -> dict[str, str]:
    filename = file.filename or "untitled"
    documents = load_uploaded_file(filename, await file.read())
    document_id = retrieval_service.add_documents(documents, filename)
    return {
        "id": document_id,
        "filename": file.filename or "untitled",
        "status": "indexed",
        "message": "Document split, embedded, and added to the local Chroma index.",
    }


@app.get("/api/documents")
def list_documents() -> dict[str, list[dict[str, str]]]:
    return {"documents": retrieval_service.list_sources()}


@app.post("/api/search")
def search(request: QueryRequest) -> dict[str, object]:
    documents = retrieval_service.search(request.query, request.source)
    return {
        "query": request.query,
        "results": [
            {"content": document.page_content, "source": document.metadata["source"]}
            for document in documents
        ],
    }


@app.post("/api/chat")
def chat(request: QueryRequest) -> dict[str, object]:
    documents = retrieval_service.search(request.query, request.source)
    return {
        "answer": "Retrieved context is ready for the answer generation step.",
        "citations": [document.metadata["source"] for document in documents],
        "query": request.query,
    }