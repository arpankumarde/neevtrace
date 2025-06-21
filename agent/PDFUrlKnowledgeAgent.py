from os import getenv
from dotenv import load_dotenv
from agno.agent import Agent
from agno.knowledge.pdf_url import PDFUrlKnowledgeBase
from agno.vectordb.qdrant import Qdrant
from agno.vectordb.mongodb import MongoDb
from agno.models.google import Gemini
from agno.embedder.google import GeminiEmbedder


class PDFUrlKnowledgeAgent:
    def __init__(self, urls: list[str]):
        load_dotenv(override=True)
        self.collection_name = "vector-embeddings"
        self.mongo_connection_string = getenv("MONGO_CONNECTION_STRING")
        self.database_name = "agno"
        self.search_index_name = "vector-search"
        self.embedder = GeminiEmbedder()
        self.vector_db = self._init_vector_db()
        self.knowledge_base = self._init_knowledge_base(urls)
        self.agent = self._init_agent()

    def _init_vector_db(self) -> MongoDb:
        return MongoDb(
            collection_name=self.collection_name,
            db_url=self.mongo_connection_string,
            database=self.database_name,
            search_index_name=self.search_index_name,
        )

    def _init_knowledge_base(self, urls: list[str]) -> PDFUrlKnowledgeBase:
        return PDFUrlKnowledgeBase(
            urls=urls, vector_db=self.vector_db, embedder=self.embedder
        )

    def _init_agent(self) -> Agent:
        return Agent(
            knowledge=self.knowledge_base,
            # show_tool_calls=True,
            model=Gemini(id="gemini-2.0-flash"),
            system_message="You're an AI assistant called NeevTrace AI, created by Team Ingenico.",
        )

    def load_documents(self, recreate: bool = False):
        self.knowledge_base.load(recreate=recreate)

    def query(self, prompt: str, markdown: bool = True):
        return self.agent.run(prompt, markdown=markdown)


if __name__ == "__main__":
    urls = [
        "https://media.melexis.com/-/media/files/documents/certificates/iso-9001-2008-quality-certificate-melexis.pdf",
        "https://media.melexis.com/-/media/files/documents/certificates/iso-9001-iq-net-certificate.pdf",
    ]

    runner = PDFUrlKnowledgeAgent(urls=urls)
    runner.load_documents(recreate=False)
    while True:
        try:
            question = input("\nEnter your question (or 'quit' to exit): ")
            if question.lower() in ["quit", "exit", "q"]:
                print("Goodbye!")
                break
            if question.strip():
                # runner.query(question)
                ok = runner.query(question)

                print("ok: ", ok.content)
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            print("\nGoodbye!")
            break
