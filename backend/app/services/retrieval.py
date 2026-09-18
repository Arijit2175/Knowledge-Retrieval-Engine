from pathlib import Path
from uuid import uuid4

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


class RetrievalService:
    def __init__(self) -> None:
        self._vector_store: Chroma | None = None
        self._retriever: BaseRetriever | None = None
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=120,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def _get_retriever(self) -> BaseRetriever:
        if self._retriever is None:
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
            self._vector_store = Chroma(
                collection_name="knowledge_documents",
                embedding_function=embeddings,
                persist_directory=str(Path(__file__).resolve().parents[2] / "data" / "chroma"),
            )
            self._retriever = self._vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 4},
            )
        return self._retriever

    def add_documents(self, documents: list[Document], filename: str) -> str:
        chunks = self._splitter.split_documents(documents)
        document_id = f"doc-{uuid4().hex[:12]}"
        for chunk in chunks:
            chunk.metadata.update({"source": filename, "document_id": document_id})
        self._get_retriever()
        assert self._vector_store is not None
        self._vector_store.add_documents(chunks)
        return document_id

    def search(self, query: str) -> list[Document]:
        return self._get_retriever().invoke(query)


retrieval_service = RetrievalService()