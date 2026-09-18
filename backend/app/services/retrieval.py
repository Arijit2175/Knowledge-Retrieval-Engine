from pathlib import Path
from uuid import uuid4

from langchain_chroma import Chroma
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.retrievers import BaseRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChromaEmbeddings(Embeddings):
    def __init__(self) -> None:
        self._embedding_function = DefaultEmbeddingFunction()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._embedding_function(texts)

    def embed_query(self, text: str) -> list[float]:
        return self._embedding_function([text])[0]


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
            self._vector_store = Chroma(
                collection_name="knowledge_documents",
                embedding_function=ChromaEmbeddings(),
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

    def search(self, query: str, source: str | None = None) -> list[Document]:
        self._get_retriever()
        assert self._vector_store is not None
        if source:
            return self._vector_store.similarity_search(query, k=4, filter={"source": source})
        assert self._retriever is not None
        return self._retriever.invoke(query)

    def list_sources(self) -> list[dict[str, str]]:
        self._get_retriever()
        assert self._vector_store is not None
        records = self._vector_store.get(include=["metadatas"])
        sources: dict[str, str] = {}
        for metadata in records.get("metadatas", []):
            if metadata and metadata.get("source"):
                sources[metadata["source"]] = metadata.get("document_id", "")
        return [{"filename": filename, "id": document_id} for filename, document_id in sources.items()]


retrieval_service = RetrievalService()