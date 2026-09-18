import os

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

load_dotenv()


class GenerationService:
    def __init__(self) -> None:
        self._llm: ChatGroq | None = None

    @staticmethod
    def is_configured() -> bool:
        return bool(os.getenv("GROQ_API_KEY"))

    def _get_llm(self) -> ChatGroq:
        if self._llm is None:
            api_key = os.getenv("GROQ_API_KEY")
            if not self.is_configured():
                raise RuntimeError("GROQ_API_KEY is not configured")
            self._llm = ChatGroq(
                model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
                temperature=0,
                api_key=api_key,
            )
        return self._llm

    def answer(self, query: str, documents: list[Document]) -> str:
        context = "\n\n".join(
            f"Source: {document.metadata.get('source', 'unknown')}\n{document.page_content}"
            for document in documents
        )
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You answer questions using only the supplied context. "
                    "If the context does not contain the answer, say you do not know. "
                    "Be concise and do not invent facts.",
                ),
                ("human", "Question: {query}\n\nContext:\n{context}"),
            ]
        )
        try:
            response = (prompt | self._get_llm()).invoke({"query": query, "context": context})
        except Exception as error:
            raise RuntimeError(f"Groq model request failed: {error}") from error
        return str(response.content)


generation_service = GenerationService()