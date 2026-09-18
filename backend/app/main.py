from typing import Annotated

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "knowledge-retrieval-engine"}


@app.post("/api/documents")
async def upload_document(file: Annotated[UploadFile, File()]) -> dict[str, str]:
    content = (await file.read()).decode("utf-8", errors="replace")
    document_id = retrieval_service.add_document(content, file.filename or "untitled")
    return {
        "id": document_id,
        "filename": file.filename or "untitled",
        "status": "indexed",
        "message": "Document added to the LangChain retrieval index.",
    }


@app.post("/api/search")
def search(request: QueryRequest) -> dict[str, object]:
    documents = retrieval_service.search(request.query)
    return {
        "query": request.query,
        "results": [
            {"content": document.page_content, "source": document.metadata["source"]}
            for document in documents
        ],
    }


@app.post("/api/chat")
def chat(request: QueryRequest) -> dict[str, object]:
    documents = retrieval_service.search(request.query)
    return {
        "answer": "Retrieved context is ready for the answer generation step.",
        "citations": [document.metadata["source"] for document in documents],
        "query": request.query,
    }