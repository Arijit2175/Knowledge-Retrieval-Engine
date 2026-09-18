from pathlib import Path
from tempfile import NamedTemporaryFile

from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader
from langchain_core.documents import Document


def load_uploaded_file(filename: str, content: bytes) -> list[Document]:
    extension = Path(filename).suffix.lower()
    if extension in {".txt", ".md", ".markdown"}:
        return [Document(page_content=content.decode("utf-8", errors="replace"))]

    if extension not in {".pdf", ".docx"}:
        raise ValueError("Supported file types are TXT, MD, PDF, and DOCX")

    with NamedTemporaryFile(suffix=extension, delete=False) as temporary_file:
        temporary_file.write(content)
        temporary_path = temporary_file.name

    try:
        loader = PyPDFLoader(temporary_path) if extension == ".pdf" else Docx2txtLoader(temporary_path)
        return loader.load()
    finally:
        Path(temporary_path).unlink(missing_ok=True)
