import re

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from pydantic import Field


class KeywordRetriever(BaseRetriever):
    """Small local retriever used until an embedding store is configured."""

    documents: list[Document] = Field(default_factory=list)
    k: int = 4

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun,
    ) -> list[Document]:
        query_terms = set(re.findall(r"\w+", query.lower()))
        scored_documents = []
        for document in self.documents:
            document_terms = set(re.findall(r"\w+", document.page_content.lower()))
            score = len(query_terms & document_terms)
            if score:
                scored_documents.append((score, document))
        scored_documents.sort(key=lambda item: item[0], reverse=True)
        return [document for _, document in scored_documents[: self.k]]


class RetrievalService:
    def __init__(self) -> None:
        self._retriever = KeywordRetriever()

    def add_document(self, content: str, filename: str) -> str:
        document = Document(page_content=content, metadata={"source": filename})
        self._retriever.documents.append(document)
        return f"doc-{len(self._retriever.documents):04d}"

    def search(self, query: str) -> list[Document]:
        return self._retriever.invoke(query)


retrieval_service = RetrievalService()