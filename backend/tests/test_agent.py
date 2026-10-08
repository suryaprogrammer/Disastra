import asyncio
import os
import sys

# Add backend dir to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.runtime_state import runtime_state
from app.services.agent_service import agent_service
from app.schemas.agent import AgentAction

async def run_tests():
    print("Cycle 1: No observation")
    await agent_service.cycle()
    print("Action:", agent_service.state.recommended_agent_action)
    assert agent_service.state.recommended_agent_action == AgentAction.NO_ACTION

    print("\nInjecting Observation A (High Risk)...")
    runtime_state.update_disaster_observation(
        observation_id="obs-A",
        source="Test",
        analysis_result={
            "risk_assessment": {"risk_score": 85, "risk_level": "HIGH"},
            "flood_model": {"detection_count": 5, "water_area_ratio": 0.5}
        }
    )

    print("Cycle 2: First time seeing Obs A")
    await agent_service.cycle()
    print("Action:", agent_service.state.recommended_agent_action)
    print("Change detected:", agent_service.state.change_detected)
    assert agent_service.state.recommended_agent_action == AgentAction.PREPARE_ALERT

    print("\nCycle 3: Seeing Obs A again")
    await agent_service.cycle()
    print("Action:", agent_service.state.recommended_agent_action)
    assert agent_service.state.recommended_agent_action != AgentAction.PREPARE_ALERT
    assert agent_service.state.recommended_agent_action != AgentAction.REANALYZE

    print("\nInjecting Observation B (Critical Risk)...")
    runtime_state.update_disaster_observation(
        observation_id="obs-B",
        source="Test",
        analysis_result={
            "risk_assessment": {"risk_score": 95, "risk_level": "CRITICAL"},
            "flood_model": {"detection_count": 10, "water_area_ratio": 0.8}
        }
    )

    print("Cycle 4: First time seeing Obs B")
    await agent_service.cycle()
    print("Action:", agent_service.state.recommended_agent_action)
    assert agent_service.state.recommended_agent_action == AgentAction.PREPARE_ALERT
    
    print("\nAll tests passed!")

if __name__ == "__main__":
    asyncio.run(run_tests())
