import uuid
from datetime import datetime
from typing import List, Dict, Optional
from app.schemas.alert import AlertRecord, AlertPriority, AlertChannel, AlertStatus
from app.schemas.agent import AgentState
from app.schemas.ai import AIRequestPayload
from app.services.notification_service import notification_service
from app.core.config import settings

class AlertRegistry:
    def __init__(self):
        # In-memory store. Key: alert_id
        self.alerts: Dict[str, AlertRecord] = {}
        # Track generated alerts by observation_id + escalation_level to prevent duplicates
        self._obs_escalation_tracker: set = set()

    def create_alert_from_state(self, state: AgentState, payload: AIRequestPayload) -> Optional[AlertRecord]:
        """
        Creates and dispatches a deterministic alert if rules allow.
        """
        obs_id = state.observation_id
        if not obs_id:
            return None
            
        escalation_level = state.current_risk_level
        
        # Check duplicate protection
        tracker_key = f"{obs_id}_{escalation_level}"
        if tracker_key in self._obs_escalation_tracker:
            print(f"[Alert] Duplicate alert blocked for {tracker_key}")
            return None
            
        # Deterministic Priority Mapping
        priority = self._map_risk_to_priority(escalation_level)
        
        # Delivery Channels configuration (defaults)
        channels = []
        if priority == AlertPriority.CRITICAL:
            channels = [AlertChannel.WHATSAPP, AlertChannel.SMS]
        elif priority == AlertPriority.HIGH:
            channels = [AlertChannel.WHATSAPP]
            
        if not channels:
            # Below threshold
            print(f"[Alert] Escalation level {escalation_level} does not trigger external channels.")
            return None

        # Build Trusted Message
        weather_text = state.weather_summary if state.weather_status == "LIVE" else "Weather context unavailable."
        
        msg = f"*DISASTRA EMERGENCY ALERT*\n\n"
        msg += f"Risk Level: {state.current_risk_level}\n"
        msg += f"Risk Score: {state.current_risk_score}\n"
        msg += f"Detected Evidence: Water area ratio {state.current_water_area_ratio:.2f}, Detections: {state.current_detection_count}\n"
        msg += f"Weather: {weather_text}\n"
        msg += f"Recommended Action: Await official instructions from local authorities.\n"
        
        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        
        record = AlertRecord(
            alert_id=alert_id,
            created_at=datetime.utcnow().isoformat() + "Z",
            observation_id=obs_id,
            escalation_level=escalation_level,
            risk_score=state.current_risk_score,
            risk_level=state.current_risk_level,
            priority=priority,
            headline=f"{escalation_level} RISK DETECTED",
            message=msg,
            recommended_action="Await official instructions.",
            channels=channels,
            status=AlertStatus.PREPARED,
            provider=settings.ALERT_PROVIDER
        )
        
        # Mark as tracked BEFORE sending to prevent race conditions
        self._obs_escalation_tracker.add(tracker_key)
        self.alerts[alert_id] = record
        
        # Dispatch
        self._dispatch_alert(record)
        
        # Async MongoDB Persistence
        import asyncio
        from app.repositories.alert_repository import alert_repository
        from app.repositories.audit_repository import audit_repository
        
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(alert_repository.insert(record.model_dump()))
            loop.create_task(audit_repository.insert_event(
                event_type="ALERT_PREPARED",
                details={"priority": priority.value, "channels": [c.value for c in channels]},
                observation_id=obs_id,
                alert_id=alert_id
            ))
        except RuntimeError:
            # We are in a sync threadpool without an event loop
            loop = asyncio.new_event_loop()
            loop.run_until_complete(alert_repository.insert(record.model_dump()))
            loop.run_until_complete(audit_repository.insert_event(
                event_type="ALERT_PREPARED",
                details={"priority": priority.value, "channels": [c.value for c in channels]},
                observation_id=obs_id,
                alert_id=alert_id
            ))
            loop.close()
        
        return record

    def _map_risk_to_priority(self, risk_level: str) -> AlertPriority:
        mapping = {
            "CRITICAL": AlertPriority.CRITICAL,
            "HIGH": AlertPriority.HIGH,
            "MODERATE": AlertPriority.MODERATE,
            "LOW": AlertPriority.LOW
        }
        return mapping.get(risk_level, AlertPriority.LOW)

    def _dispatch_alert(self, alert: AlertRecord):
        alert.status = AlertStatus.SENDING
        
        # For Phase 12, we send to the configured single test numbers.
        success = False
        final_status = "SKIPPED"
        error_msg = None
        sid = None
        
        if AlertChannel.WHATSAPP in alert.channels:
            success, final_status, sid, error_msg = notification_service.send_whatsapp(
                to_number=settings.ALERT_WHATSAPP_TO,
                message_body=alert.message
            )
            
        elif AlertChannel.SMS in alert.channels:
            success, final_status, sid, error_msg = notification_service.send_sms(
                to_number=settings.ALERT_SMS_TO,
                message_body=alert.message
            )
            
        alert.status = AlertStatus(final_status)
        alert.provider_message_id = sid
        alert.error = error_msg
        
        if success and final_status in ["SENT", "DELIVERED"]:
            alert.sent_at = datetime.utcnow().isoformat() + "Z"
            if final_status == "DELIVERED":
                alert.delivered_at = datetime.utcnow().isoformat() + "Z"

    def get_all_alerts(self) -> List[AlertRecord]:
        return sorted(list(self.alerts.values()), key=lambda x: x.created_at, reverse=True)

    def get_alert_by_id(self, alert_id: str) -> Optional[AlertRecord]:
        return self.alerts.get(alert_id)
        
    def update_delivery_status(self, provider_message_id: str, new_status: str):
        # Webhook handler maps twilio status back
        mapped_status = notification_service._map_twilio_status(new_status)
        
        for alert in self.alerts.values():
            if alert.provider_message_id == provider_message_id:
                alert.status = AlertStatus(mapped_status)
                if mapped_status == "DELIVERED" and not alert.delivered_at:
                    alert.delivered_at = datetime.utcnow().isoformat() + "Z"
                    
                # Async MongoDB Persistence
                import asyncio
                from app.repositories.alert_repository import alert_repository
                from app.repositories.audit_repository import audit_repository
                
                updates = {"status": alert.status.value}
                if alert.delivered_at:
                    updates["delivered_at"] = alert.delivered_at
                    
                try:
                    loop = asyncio.get_running_loop()
                    loop.create_task(alert_repository.update_status(alert.alert_id, updates))
                    loop.create_task(audit_repository.insert_event(
                        event_type=f"ALERT_{alert.status.value}",
                        details={"provider_message_id": provider_message_id},
                        observation_id=alert.observation_id,
                        alert_id=alert.alert_id
                    ))
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    loop.run_until_complete(alert_repository.update_status(alert.alert_id, updates))
                    loop.run_until_complete(audit_repository.insert_event(
                        event_type=f"ALERT_{alert.status.value}",
                        details={"provider_message_id": provider_message_id},
                        observation_id=alert.observation_id,
                        alert_id=alert.alert_id
                    ))
                    loop.close()
                return

alert_registry = AlertRegistry()
