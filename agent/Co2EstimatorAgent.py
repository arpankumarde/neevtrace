from os import getenv
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.arxiv import ArxivTools
from agno.tools.wikipedia import WikipediaTools
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.google_maps import GoogleMapTools
from pydantic import BaseModel, Field


class Co2Estimate(BaseModel):
    estimate: float = Field(
        ...,
        description="The calculated CO2 equivalent estimate as a numeric value.",
    )
    unit: str = Field(
        ..., description="The unit of measurement (e.g., 'kg CO2e', 't CO2e')"
    )


class Co2EstimatorAgent:
    def __init__(self):
        load_dotenv(override=True)
        self.agent = self._init_agent()

    def _init_agent(self) -> Agent:
        return Agent(
            tools=[ArxivTools(), WikipediaTools(), DuckDuckGoTools()],
            model=Gemini(id="gemini-2.0-flash"),
            system_message="You are a helpful AI assistant specializing in environmental data analysis for logistics and freight. Your primary task is to interpret shipment routes and transportation methods described in natural language and calculate the approximate carbon footprint (CO₂e) of the shipment. > > 2. Route Analysis & Enrichment > - When distance or duration is not provided, use integrated tools to: > - Identify location coordinates and validate addresses. > - Estimate distances and travel time across transport legs. > > 3. CO₂e Calculation > - Apply emission factors per ton-kilometer or container-kilometer based on transport mode. > - Adjust estimates for: > - Fuel type and efficiency. > - Container load utilization. > - Handling type (e.g., reefer, bulk, consolidated). > > 4. Tool Access & Integration > - Convert shipment units (e.g., TEU, CBM, weight). > - Translate CO₂e into alternative formats if needed. > > 5. Output Requirements > - All results must be delivered exclusively in CO₂e (carbon dioxide equivalent) units. > - Use kg CO₂e, based on shipment scale—no other emissions units are allowed. > > Important Constraints > - Use standard units and avoid citing sources. > - Output must never include non-CO₂e units (e.g., grams, MJ, or NOx equivalents).",
            response_model=Co2Estimate,
        )

    def query(self, prompt: str, markdown: bool = False):
        return self.agent.run(prompt, markdown=markdown)


def main(query: str = ""):
    runner = Co2EstimatorAgent()
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


__all__ = ["Co2EstimatorAgent", "Co2Estimate"]
