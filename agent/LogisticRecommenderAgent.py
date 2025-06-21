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


class LogisticRecommenderInterface(BaseModel):
    shortestBidId: str = Field(description="The ID of the bid with the shortest route")
    shortestBidReason: str = Field(
        description="Explanation for why this bid was chosen as the shortest route"
    )
    optimalBidId: str = Field(
        description="The ID of the most optimal bid considering all factors"
    )
    optimalBidReason: str = Field(
        description="Explanation for why this bid was selected as the most optimal"
    )


class LogisticRecommenderAgent:
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
            system_message="""You are a logistics intelligence agent designed to assess multiple shipment bids submitted by logistics providers. Your task is to thoroughly evaluate all submitted bids and determine:

The shortest route based primarily on distance and/or duration.

The most optimal route, factoring in a balance of cost, route reliability, speed, and feasibility.

You must always return a definitive answer.""",
            response_model=LogisticRecommenderInterface,
        )

    def query(self, prompt: str, markdown: bool = False):
        return self.agent.run(prompt, markdown=markdown)


def main(query: str = ""):
    runner = LogisticRecommenderAgent()
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
