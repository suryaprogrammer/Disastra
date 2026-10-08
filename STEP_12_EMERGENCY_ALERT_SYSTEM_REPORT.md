# STEP 12: EMERGENCY ALERT SYSTEM REPORT

## Architecture Summary
An emergency alert orchestration system integrating the deterministic Phase 7 autonomous agent directly with external SMS and WhatsApp delivery services. The architecture implements an in-memory alert registry, preventing duplicate escalation broadcasts, and a notification service adapter designed around the Twilio client.

**Core Workflow:**
1. Phase 7 `AgentService` flags a deterministic `PREPARE_ALERT` state.
2. `AlertRegistry` evaluates the active `observation_id` + `escalation_level` to block duplicates.
3. If valid, an `AlertRecord` is constructed using verified system data—Gemini has zero involvement in triggering or constructing the hard facts.
4. `NotificationService` routes the payload to the configured Twilio accounts for WhatsApp and SMS, capturing initial synchronous statuses (`QUEUED`, `SKIPPED`, `FAILED`).
5. A Webhook endpoint (`POST /api/alerts/webhook`) is ready to listen for asynchronous delivery state updates directly from the provider.
6. Frontend `AlertTimeline` visualizes real-time status.

## Environment Configuration
The backend safely extracts Twilio secrets using Pydantic Settings from `backend/.env`. These are strictly server-side, never exposed to the frontend:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `ALERT_WHATSAPP_TO`
- `TWILIO_SMS_FROM`
- `ALERT_SMS_TO`

## Notification Provider
The system leverages Twilio via the `twilio` Python package for its implementation adapter.

### Twilio WhatsApp
Supports sending through the Twilio Sandbox. Trial limitations require an approved sandbox template and verified recipient phone numbers. Unrestricted production messaging is disabled until the user provisions a live WhatsApp Business Profile via Twilio.

### Twilio SMS
Supports standard REST-based SMS dispatch. However, domestic Indian SMS sending requires applicable DLT (Distributed Ledger Technology) and Sender ID registration. Without compliance, Indian telecommunication carriers will forcefully drop the messages.

## Duplicate Protection
The `AlertRegistry` uses an in-memory `Set` tracker that records `{observation_id}_{escalation_level}`.
- First sighting of Observation A + HIGH: Creates and dispatches alert.
- Second sighting of Observation A + HIGH: Blocked silently.
- Sighting of Observation A + CRITICAL: Passes duplicate check as a new escalation level.

## Deterministic Priority Logic
Risk severity dictates automated messaging paths:
- **CRITICAL** -> `[WHATSAPP, SMS]`
- **HIGH** -> `[WHATSAPP]`
- **MODERATE** -> Ignored
- **LOW** -> Ignored

## Delivery Status & Failure Handling
Statuses adhere strictly to provider responses:
- `PREPARED`: Formatting
- `QUEUED` / `SENDING` / `SENT`: Handed to provider
- `DELIVERED`: Confirmed delivered by provider (e.g. via webhook)
- `FAILED`: Hard bounce or bad credentials
- `SKIPPED`: Provider not configured or missing environment variables

FastAPI handles `TwilioRestException` exceptions natively to gracefully fail without crashing the Uvicorn worker instance.

## Frontend Integration
`AlertTimeline.tsx` was rewritten to ingest `AlertRecord` models instead of legacy `DisasterAlertEvent` mocks. Added explicit badge styling for accurate statuses (`DELIVERED`, `SKIPPED`). The "Simulate Ingested Event" button was functionally replaced by a "Trigger Test Alert" executing `POST /api/alerts/test` (clearly marked with `[DEMO]`). 

## Security Verification
- `backend/.env` remains untracked.
- Browser network calls only hit `/api/alerts`, returning sanitized alert logs without API tokens.
- Gemini API is completely cordoned off from the alert formatting and triggering path.

## Quality Checks
✅ `npm run lint` - Passed.
✅ `npm run build` - Vite output successful.
✅ Python Test Script - Passed duplicate verification and API response parsing.

## IMPORTANT FINAL CLAIM
*This represents an emergency alert orchestration system with real provider delivery support and verified WhatsApp trial testing readiness.*

*This is **not** a production-ready emergency communication system until a live Twilio account with appropriate SMS DLT Sender IDs and a registered WhatsApp Business Profile has been fully configured.*
