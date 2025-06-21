from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from Co2EstimatorAgent import Co2EstimatorAgent
from RouteOptimizerAgent import RouteOptimizerAgent
from LogisticRecommenderAgent import LogisticRecommenderAgent

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()}), 200


@app.route("/co2-estimate", methods=["POST"])
def co2_estimate():
    """Endpoint to get CO2 estimate."""
    data = request.json
    if not data or "query" not in data:
        return jsonify({"error": "Invalid input, 'query' is required"}), 400

    query = data["query"]
    response: str = str(Co2EstimatorAgent().query(query).content)

    estimate_data = response.split("estimate=")[1].split(" unit=")
    estimate_value = float(estimate_data[0].strip())
    unit_value = estimate_data[1].strip().strip("'\"")

    estimate = {"estimate": estimate_value, "unit": unit_value}

    # print(estimate)

    return jsonify(estimate), 200


@app.route("/route-optimizer", methods=["POST"])
def route_optimizer():
    """Endpoint to optimize route and get CO2 estimate."""
    data = request.json
    if not data or "query" not in data:
        return jsonify({"error": "Invalid input, 'query' is required"}), 400

    query = data["query"]
    response: str = str(RouteOptimizerAgent().query(query).content)

    # Parse the response to extract pros, cons, estimate, and unit
    pros_data = response.split("pros=")[1].split(" cons=")
    pros_value = pros_data[0].strip().strip("'\"")

    cons_data = response.split("cons=")[1].split(" estimate=")
    cons_value = cons_data[0].strip().strip("'\"")

    estimate_data = response.split("estimate=")[1].split(" unit=")
    estimate_value = float(estimate_data[0].strip())
    unit_value = estimate_data[1].strip().strip("'\"")

    result = {
        "pros": pros_value,
        "cons": cons_value,
        "estimate": estimate_value,
        "unit": unit_value,
    }

    return jsonify(result), 200


@app.route("/logistic-recommender", methods=["POST"])
def logistic_recommender():
    """Endpoint to get logistic recommendations for a route."""
    data = request.json
    if not data or "query" not in data:
        return jsonify({"error": "Invalid input, 'query' is required"}), 400

    query = data["query"]
    response: str = str(LogisticRecommenderAgent().query(query).content)

    # Parse the response to extract shortestBidId, shortestBidReason, optimalBidId, and optimalBidReason
    shortest_bid_id_data = response.split("shortestBidId=")[1].split(
        " shortestBidReason="
    )
    shortest_bid_id_value = shortest_bid_id_data[0].strip().strip("'\"")

    shortest_bid_reason_data = response.split("shortestBidReason=")[1].split(
        " optimalBidId="
    )
    shortest_bid_reason_value = shortest_bid_reason_data[0].strip().strip("'\"")

    optimal_bid_id_data = response.split("optimalBidId=")[1].split(" optimalBidReason=")
    optimal_bid_id_value = optimal_bid_id_data[0].strip().strip("'\"")

    optimal_bid_reason_data = response.split("optimalBidReason=")[1]
    optimal_bid_reason_value = optimal_bid_reason_data.strip().strip("'\"")

    result = {
        "shortestBidId": shortest_bid_id_value,
        "shortestBidReason": shortest_bid_reason_value,
        "optimalBidId": optimal_bid_id_value,
        "optimalBidReason": optimal_bid_reason_value,
    }

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
