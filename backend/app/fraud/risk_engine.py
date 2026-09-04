from typing import List, Dict, Any

RISK_CONFIG = {
    # Weights for risk score out of 100
    "XGB_WEIGHT": 45.0,
    "RF_WEIGHT": 15.0,
    "IF_WEIGHT": 10.0,
    "RULES_WEIGHT": 30.0,
    
    # Severity points for rule scoring
    "SEVERITY_POINTS": {
        "CRITICAL": 30,
        "HIGH": 20,
        "MEDIUM": 10,
        "LOW": 5
    },
    
    # Risk bands
    "LEVELS": [
        {"name": "LOW", "max": 29, "action": "ALLOW"},
        {"name": "MEDIUM", "max": 59, "action": "MONITOR"},
        {"name": "HIGH", "max": 79, "action": "MANUAL_REVIEW"},
        {"name": "CRITICAL", "max": 100, "action": "BLOCK_OR_REVIEW"}
    ]
}

class RiskEngine:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or RISK_CONFIG

    def evaluate(self, 
                 transaction_id: str, 
                 xgb_prob: float, 
                 rf_prob: float, 
                 iso_score: float, 
                 triggered_rules: List[Dict[str, Any]],
                 feature_signals: List[str]) -> Dict[str, Any]:
        """
        Combines supervised ML, anomaly detection, fraud rules, and behavioral signals.
        """
        # Calculate Rule Risk Score
        rule_score = 0.0
        categories = set()
        risk_factors = list(feature_signals)  # Start with feature engine signals
        
        for rule in triggered_rules:
            sev = rule.get("severity", "LOW")
            points = self.config["SEVERITY_POINTS"].get(sev, 5)
            rule_score += points
            categories.add(rule.get("category"))
            
            # Avoid duplicate explanations
            reason = rule.get("reason")
            if reason and reason not in risk_factors:
                risk_factors.append(reason)
                
        # Cap rule score at 100 before weighting
        rule_score = min(rule_score, 100.0)
        
        # Calculate total weighted risk score [0, 100]
        # Probabilities and ISO score are [0, 1], so multiply by 100 before weighting
        weighted_score = (
            (xgb_prob * 100.0 * (self.config["XGB_WEIGHT"] / 100.0)) +
            (rf_prob * 100.0 * (self.config["RF_WEIGHT"] / 100.0)) +
            (iso_score * 100.0 * (self.config["IF_WEIGHT"] / 100.0)) +
            (rule_score * (self.config["RULES_WEIGHT"] / 100.0))
        )
        
        final_risk_score = min(max(int(round(weighted_score)), 0), 100)
        
        # Determine Risk Level and Action
        risk_level = "CRITICAL"
        action = "BLOCK_OR_REVIEW"
        
        for level in self.config["LEVELS"]:
            if final_risk_score <= level["max"]:
                risk_level = level["name"]
                action = level["action"]
                break
                
        # Supervised fraud probability (weighted combination of supervised models)
        # XGB is weighted 3x heavier than RF in supervised terms based on our main weights (45 vs 15)
        fraud_prob = (xgb_prob * 0.75) + (rf_prob * 0.25)
        
        return {
            "transaction_id": transaction_id,
            "xgboost_probability": float(xgb_prob),
            "random_forest_probability": float(rf_prob),
            "isolation_forest_score": float(iso_score),
            "rule_risk_score": int(rule_score),
            "fraud_probability": float(fraud_prob),
            "risk_score": final_risk_score,
            "risk_level": risk_level,
            "recommended_action": action,
            "fraud_categories": list(categories),
            "risk_factors": risk_factors
        }
