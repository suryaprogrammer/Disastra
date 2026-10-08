import asyncio
import uuid
import datetime
from typing import Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

from app.core.config import settings
from app.schemas.agent import AgentState, AgentAction, AgentStatus
from app.services.runtime_state import runtime_state
from app.services import weather_service
from app.services.gemini_service import gemini_service
from app.schemas.ai import AIRequestPayload

# TypedDict for LangGraph state
class AgentGraphState(TypedDict):
    state: AgentState

# LangGraph Node Functions
async def collect_weather(state_dict: AgentGraphState) -> AgentGraphState:
    agent_state = state_dict["state"]
    try:
        # Default coords for now: Mumbai
        weather_resp = await weather_service.get_weather(19.076, 72.8777)
        agent_state.weather_status = "LIVE"
        agent_state.weather_summary = f"{weather_resp.weather.temperature_c}°C, {weather_resp.weather.condition}"
    except Exception as e:
        agent_state.weather_status = "UNAVAILABLE"
        agent_state.weather_summary = str(e)
    return {"state": agent_state}

async def load_disaster_state(state_dict: AgentGraphState) -> AgentGraphState:
    agent_state = state_dict["state"]
    latest_obs = runtime_state.latest_disaster_observation
    
    if not latest_obs:
        return {"state": agent_state}
        
    # We found an observation. Check if it's new compared to what we have in state.
    if latest_obs["observation_id"] != agent_state.observation_id:
        agent_state.observation_id = latest_obs["observation_id"]
        agent_state.observation_created_at = latest_obs["created_at"]
        agent_state.observation_source = latest_obs["source"]
        
        # Shift current to previous
        agent_state.previous_risk_score = agent_state.current_risk_score
        agent_state.previous_risk_level = agent_state.current_risk_level
        agent_state.previous_detection_count = agent_state.current_detection_count
        agent_state.previous_water_area_ratio = agent_state.current_water_area_ratio
        
        risk = latest_obs["analysis_result"]["risk_assessment"]
        flood = latest_obs["analysis_result"]["flood_model"]
        
        # Set new current — paths match RiskAnalysisResponse.model_dump() and FloodAnalysisResponse.model_dump()
        agent_state.current_risk_score = risk["risk_assessment"]["risk_score"]
        agent_state.current_risk_level = risk["risk_assessment"]["risk_level"]
        agent_state.current_detection_count = flood["analysis"]["detection_count"]
        agent_state.current_water_area_ratio = risk["evidence"]["water_area_ratio"]
        
    return {"state": agent_state}

async def compare_state(state_dict: AgentGraphState) -> AgentGraphState:
    agent_state = state_dict["state"]
    
    change_reasons = []
    
    # If no disaster observation exists, no meaningful disaster change
    if agent_state.observation_id is None:
        agent_state.change_detected = False
        agent_state.change_reasons = ["No disaster observation available."]
        return {"state": agent_state}

    # Evaluate changes
    # Ensure previous exists before delta calculation. If it doesn't exist but current does, it's a new baseline.
    if agent_state.previous_risk_score is None and agent_state.current_risk_score is not None:
        change_reasons.append("Initial disaster observation received.")
    else:
        if agent_state.previous_risk_score is not None and agent_state.current_risk_score is not None:
            score_delta = abs(agent_state.current_risk_score - agent_state.previous_risk_score)
            if score_delta >= settings.AGENT_RISK_SCORE_DELTA:
                change_reasons.append(f"Risk score changed by {score_delta}")
                
        if agent_state.previous_risk_level is not None and agent_state.current_risk_level is not None:
            if agent_state.current_risk_level != agent_state.previous_risk_level:
                change_reasons.append(f"Risk level transitioned from {agent_state.previous_risk_level} to {agent_state.current_risk_level}")
                
        if agent_state.previous_detection_count is not None and agent_state.current_detection_count is not None:
            det_delta = abs(agent_state.current_detection_count - agent_state.previous_detection_count)
            if det_delta >= settings.AGENT_DETECTION_COUNT_DELTA:
                change_reasons.append(f"Detection count changed by {det_delta}")
                
        if agent_state.previous_water_area_ratio is not None and agent_state.current_water_area_ratio is not None:
            area_delta = abs(agent_state.current_water_area_ratio - agent_state.previous_water_area_ratio)
            if area_delta >= settings.AGENT_WATER_AREA_DELTA:
                change_reasons.append(f"Water area ratio changed by {area_delta:.2f}")

    if change_reasons:
        agent_state.change_detected = True
        agent_state.change_reasons = change_reasons
    else:
        agent_state.change_detected = False
        agent_state.change_reasons = ["No material changes detected within thresholds."]
        
    return {"state": agent_state}

async def decide_action(state_dict: AgentGraphState) -> AgentGraphState:
    agent_state = state_dict["state"]
    
    if agent_state.observation_id is None:
        agent_state.recommended_agent_action = AgentAction.NO_ACTION
        return {"state": agent_state}
        
    # To determine REANALYZE or PREPARE_ALERT, we must be tracking *whether we already acted on this observation*.
    # In a real system, we'd have an 'observation_acted_upon' flag or use graph state. 
    # For now, we will use the `last_gemini_summary` as a proxy, or better, we track it in the service layer.
    # Actually, we can add a simple local check: if change_detected, we prepare alert or reanalyze.
    # But wait, PREPARE_ALERT is deterministic and based on escalation.
    
    escalated = False
    if agent_state.current_risk_level in ["HIGH", "CRITICAL"] and agent_state.change_detected:
        escalated = True
    elif agent_state.current_risk_score and agent_state.current_risk_score >= 80 and agent_state.change_detected:
        escalated = True
        
    # Is it a new observation? (We can tell if previous != current)
    # Actually, if we just set current = previous, then change_detected is False.
    # If we already evaluated this observation in a previous cycle, `load_disaster_state` doesn't overwrite `previous_` with `current_`,
    # so `compare_state` will see `current == previous` EXCEPT it compares current to previous which was set when the observation FIRST arrived!
    # Let's fix that conceptually. The agent needs to know if it already processed THIS exact observation_id.
    
    # We will track `processed_observation_id` in the `agent_service` itself to prevent duplicate firing.
    pass  # We will do this logically below.
    
    return {"state": agent_state}

async def generate_reasoning(state_dict: AgentGraphState) -> AgentGraphState:
    agent_state = state_dict["state"]
    
    if not agent_state.change_detected:
        return {"state": agent_state}
        
    try:
        # Build fake payload for Gemini
        payload = AIRequestPayload()
        # In a real scenario we pass the actual data
        # For this demo we just ask Gemini to explain the change reasons
        # But we need real flood/risk/weather payloads.
        # We can extract them from runtime_state
        obs = runtime_state.latest_disaster_observation
        if obs:
            from app.schemas.ai import FloodContext, RiskContext
            flood_data = obs["analysis_result"]["flood_model"]
            risk_data = obs["analysis_result"]["risk_assessment"]
            
            max_conf = 0.0
            if flood_data.get("detections"):
                max_conf = max(d["confidence"] for d in flood_data["detections"])
                
            payload.flood = FloodContext(
                water_detected=flood_data["analysis"]["water_detected"],
                detection_count=flood_data["analysis"]["detection_count"],
                maximum_confidence=max_conf,
                water_area_ratio=risk_data["evidence"]["water_area_ratio"],
                analysis_timestamp=obs["created_at"]
            )
            payload.risk = RiskContext(
                risk_score=risk_data["risk_assessment"]["risk_score"],
                risk_level=risk_data["risk_assessment"]["risk_level"]
            )
        
        payload.weather_status = agent_state.weather_status
        
        resp = gemini_service.generate_brief(payload)
        agent_state.last_gemini_summary = resp.situation_report.executive_summary
    except Exception as e:
        print(f"Agent Gemini error: {e}")
        agent_state.last_error = str(e)
        
    return {"state": agent_state}

async def persist_runtime_state(state_dict: AgentGraphState) -> AgentGraphState:
    # Nothing extra to do right now, the service layer holds the agent_state reference
    return state_dict

# Build LangGraph
workflow = StateGraph(AgentGraphState)
workflow.add_node("collect_weather", collect_weather)
workflow.add_node("load_disaster_state", load_disaster_state)
workflow.add_node("compare_state", compare_state)
workflow.add_node("decide_action", decide_action)
workflow.add_node("generate_reasoning", generate_reasoning)
workflow.add_node("persist_runtime_state", persist_runtime_state)

workflow.add_edge(START, "collect_weather")
workflow.add_edge("collect_weather", "load_disaster_state")
workflow.add_edge("load_disaster_state", "compare_state")
workflow.add_edge("compare_state", "decide_action")
workflow.add_edge("decide_action", "generate_reasoning")
workflow.add_edge("generate_reasoning", "persist_runtime_state")
workflow.add_edge("persist_runtime_state", END)

agent_graph = workflow.compile()

class AgentService:
    def __init__(self):
        self.status = AgentStatus.IDLE
        self.task: Optional[asyncio.Task] = None
        self.state: AgentState = self._create_initial_state()
        self.processed_observation_id: Optional[str] = None
        
    def _create_initial_state(self) -> AgentState:
        return AgentState(
            agent_cycle_id=f"cycle-{uuid.uuid4()}",
            started_at=datetime.datetime.utcnow().isoformat() + "Z"
        )
        
    async def cycle(self):
        """Run exactly one manual monitoring cycle."""
        self.status = AgentStatus.RUNNING
        self.state.agent_cycle_id = f"cycle-{uuid.uuid4()}"
        self.state.started_at = datetime.datetime.utcnow().isoformat() + "Z"
        self.state.completed_at = None
        
        try:
            # We must handle the action logic here with access to processed_observation_id
            inputs = {"state": self.state}
            result = await agent_graph.ainvoke(inputs)
            self.state = result["state"]
            
            # Post-graph Decision Logic
            if self.state.observation_id is None:
                self.state.recommended_agent_action = AgentAction.NO_ACTION
            else:
                if self.state.observation_id == self.processed_observation_id:
                    # Same observation. Has weather changed significantly?
                    if self.state.change_detected:
                         self.state.recommended_agent_action = AgentAction.MONITOR
                    else:
                        if self.state.current_risk_level in ["CRITICAL", "HIGH"]:
                             self.state.recommended_agent_action = AgentAction.MONITOR
                        else:
                             self.state.recommended_agent_action = AgentAction.NO_ACTION
                else:
                    # NEW Observation!
                    escalated = False
                    if self.state.current_risk_level in ["CRITICAL", "HIGH"]:
                        escalated = True
                    if self.state.current_risk_score and self.state.current_risk_score >= 80:
                        escalated = True
                        
                    if escalated and self.state.change_detected:
                        self.state.recommended_agent_action = AgentAction.PREPARE_ALERT
                    elif self.state.change_detected:
                        self.state.recommended_agent_action = AgentAction.REANALYZE
                    else:
                        self.state.recommended_agent_action = AgentAction.NO_ACTION
                    
                    # Mark as processed
                    self.processed_observation_id = self.state.observation_id
                    
            if self.state.recommended_agent_action == AgentAction.PREPARE_ALERT:
                # Dispatch alert asynchronously/synchronously depending on config, here we do it inline
                from app.services.alert_registry import alert_registry
                # We can't access payload easily here, but create_alert_from_state doesn't need it
                alert_registry.create_alert_from_state(self.state, None)
                    
            self.state.completed_at = datetime.datetime.utcnow().isoformat() + "Z"
            
            # Async MongoDB Persistence
            import asyncio
            from app.repositories.agent_repository import agent_repository
            from app.repositories.audit_repository import audit_repository
            
            doc = self.state.model_dump()
            doc["created_at"] = datetime.datetime.utcnow().isoformat() + "Z"
            
            # Fire and forget (since we are inside an async event loop)
            # Actually, _run_cycle might not be an async function, let's check. 
            # Wait, `agent_service.py` `_run_cycle` is async. I can just `await agent_repository.insert(doc)` or use asyncio.create_task.
            asyncio.create_task(agent_repository.insert(doc))
            asyncio.create_task(audit_repository.insert_event(
                event_type="AGENT_CYCLE_COMPLETED",
                details={"action": self.state.recommended_agent_action.value},
                observation_id=self.state.observation_id,
                agent_cycle_id=self.state.agent_cycle_id
            ))
            
        except Exception as e:
            self.state.last_error = str(e)
            self.status = AgentStatus.ERROR
            print(f"[Agent] Cycle Error: {e}")
        finally:
            if self.status != AgentStatus.STOPPED:
                self.status = AgentStatus.IDLE

    async def _loop(self):
        self.status = AgentStatus.MONITORING
        interval = settings.AGENT_CYCLE_INTERVAL_SECONDS
        while self.status in [AgentStatus.MONITORING, AgentStatus.RUNNING, AgentStatus.WAITING, AgentStatus.IDLE]:
            await self.cycle()
            if self.status == AgentStatus.STOPPED:
                break
            self.status = AgentStatus.WAITING
            try:
                await asyncio.sleep(interval)
            except asyncio.CancelledError:
                break
        self.status = AgentStatus.STOPPED

    def start(self):
        if self.task is not None and not self.task.done():
            # Already running
            return
        self.status = AgentStatus.MONITORING
        self.task = asyncio.create_task(self._loop())
        
    def stop(self):
        self.status = AgentStatus.STOPPED
        if self.task:
            self.task.cancel()
            self.task = None

agent_service = AgentService()
