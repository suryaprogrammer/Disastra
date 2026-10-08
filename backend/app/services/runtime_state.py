from typing import Optional, Dict, Any
from datetime import datetime

class RuntimeState:
    def __init__(self):
        # A dictionary holding the latest disaster observation
        # Keys: 'observation_id', 'created_at', 'source', 'analysis_result'
        self.latest_disaster_observation: Optional[Dict[str, Any]] = None

    def update_disaster_observation(self, observation_id: str, source: str, analysis_result: Any):
        self.latest_disaster_observation = {
            "observation_id": observation_id,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "source": source,
            "analysis_result": analysis_result
        }

runtime_state = RuntimeState()
