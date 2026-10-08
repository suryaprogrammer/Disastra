import os
from typing import Optional, Dict, Any, Tuple
from app.core.config import settings

# Attempt to load twilio, but don't crash if it's not installed
try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

class NotificationService:
    def __init__(self):
        self.twilio_client = None
        self._init_twilio()

    def _init_twilio(self):
        if TWILIO_AVAILABLE and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            except Exception as e:
                print(f"[Notification] Failed to initialize Twilio client: {e}")

    def send_whatsapp(self, to_number: str, message_body: str) -> Tuple[bool, str, Optional[str], Optional[str]]:
        """
        Sends a WhatsApp message via Twilio.
        Returns: (success_boolean, status_string, provider_message_id, error_message)
        """
        if not self.twilio_client:
            return False, "SKIPPED", None, "Provider not configured"
            
        if not settings.TWILIO_WHATSAPP_FROM:
            return False, "SKIPPED", None, "TWILIO_WHATSAPP_FROM not configured"

        if not to_number:
            return False, "SKIPPED", None, "Recipient not configured"

        # Twilio WhatsApp numbers usually require 'whatsapp:' prefix
        from_formatted = settings.TWILIO_WHATSAPP_FROM if settings.TWILIO_WHATSAPP_FROM.startswith("whatsapp:") else f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}"
        to_formatted = to_number if to_number.startswith("whatsapp:") else f"whatsapp:{to_number}"

        try:
            message = self.twilio_client.messages.create(
                from_=from_formatted,
                body=message_body,
                to=to_formatted
            )
            
            # Map Twilio status to our AlertStatus
            status = self._map_twilio_status(message.status)
            return True, status, message.sid, None
            
        except TwilioRestException as e:
            return False, "FAILED", None, str(e)
        except Exception as e:
            return False, "FAILED", None, f"Unknown error: {str(e)}"

    def send_sms(self, to_number: str, message_body: str) -> Tuple[bool, str, Optional[str], Optional[str]]:
        """
        Sends an SMS message via Twilio.
        Returns: (success_boolean, status_string, provider_message_id, error_message)
        """
        if not self.twilio_client:
            return False, "SKIPPED", None, "Provider not configured"
            
        if not settings.TWILIO_SMS_FROM:
            return False, "SKIPPED", None, "TWILIO_SMS_FROM not configured (Requires DLT/Sender ID for India)"

        if not to_number:
            return False, "SKIPPED", None, "Recipient not configured"

        try:
            message = self.twilio_client.messages.create(
                from_=settings.TWILIO_SMS_FROM,
                body=message_body,
                to=to_number
            )
            
            status = self._map_twilio_status(message.status)
            return True, status, message.sid, None
            
        except TwilioRestException as e:
            return False, "FAILED", None, str(e)
        except Exception as e:
            return False, "FAILED", None, f"Unknown error: {str(e)}"

    def _map_twilio_status(self, twilio_status: str) -> str:
        """Map Twilio native status strings to Disastra AlertStatus strings."""
        status_map = {
            "queued": "QUEUED",
            "sending": "SENDING",
            "sent": "SENT",
            "delivered": "DELIVERED",
            "failed": "FAILED",
            "undelivered": "FAILED"
        }
        return status_map.get(twilio_status.lower(), "SENT")

notification_service = NotificationService()
