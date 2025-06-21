from os import getenv
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.arxiv import ArxivTools
from agno.tools.wikipedia import WikipediaTools
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.google_maps import GoogleMapTools
from agno.tools.newspaper4k import Newspaper4kTools
from pydantic import BaseModel, Field


class RouteOptimizeInterface(BaseModel):
    pros: str = Field(
        ...,
        description="The advantages or positive aspects of the proposed route, such as reduced emissions, cost savings, or improved efficiency.",
    )
    cons: str = Field(
        ...,
        description="The disadvantages or negative aspects of the proposed route, such as increased travel time, higher costs, or logistical challenges.",
    )
    estimate: float = Field(
        ...,
        description="The calculated CO2 equivalent estimate as a numeric value.",
    )
    unit: str = Field(
        ..., description="The unit of measurement (e.g., 'kg CO2e', 't CO2e')"
    )


class RouteOptimizerAgent:
    def __init__(self):
        load_dotenv(override=True)
        self.agent = self._init_agent()

    def _init_agent(self) -> Agent:
        return Agent(
            tools=[
                ArxivTools(),
                WikipediaTools(),
                DuckDuckGoTools(),
                Newspaper4kTools(),
            ],
            model=Gemini(id="gemini-2.0-flash"),
            system_message="You are a highly capable AI assistant specializing in environmental logistics, multimodal route assessment, and carbon footprint (CO₂e) estimation. Your primary responsibility is to analyze shipment routes described in natural language, assess logistical risks and infrastructure constraints, and provide CO₂e estimates along with route viability insights.",
            response_model=RouteOptimizeInterface,
        )

    def query(self, prompt: str, markdown: bool = False):
        return self.agent.run(prompt, markdown=markdown)


def main(query: str = ""):
    runner = RouteOptimizerAgent()
    try:
        # runner.query(question)
        response: str = str(runner.query(query).content)

        # print(response.content)
        # response.content looks like: "estimate=6912.0 unit='kg CO2e'", extract data fro stringto make a json
        estimate_data = response.split("estimate=")[1].split(" unit=")
        estimate_value = float(estimate_data[0].strip())
        unit_value = estimate_data[1].strip().strip("'\"")

        estimate = {"estimate": estimate_value, "unit": unit_value}

        return estimate
    except EOFError:
        return {"error": "EOFError: No input provided."}
