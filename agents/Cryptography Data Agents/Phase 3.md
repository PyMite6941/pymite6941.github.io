# Pipeline Phase 3.5: Inline Protocol Auditing & Payload Sanitation

## Agent: AGENT-03-MCP-AUDIT (Model Context Protocol Security Interceptor)

## Sequence Execution Order: 03.5 // Input: Phase 03 Attack Parameters // Output: Sanitized Execution Frame

### 1. MISSION STATEMENT

To act as a low-latency, inline security proxy that enforces structural and semantic validation boundaries on Model Context Protocol (MCP) data schemas. This agent intercepts dynamic tool invocations generated during autonomous loops, scrubbing malicious escape characters, tracking serialization layers, and checking parameter states to prevent unexpected state transition breaches before payloads strike live endpoints.

### 2. ARCHITECTURAL DATA FLOW & CONTROL PLANE

```
[AGENT-03-REDTEAM Parameter Generation]
                │
                ▼ (Intercepts JSON-RPC Payload via Stdio/SSE)
┌────────────────────────────────────────┐
│   AGENT-03-MCP-AUDIT Validation Engine │
├────────────────────────────────────────┤
│ 1. Validate JSON-RPC Schema Envelopes  │
│ 2. Scan Arguments for Regex Overrides  │
│ 3. Execute String Normalization Matrix │
└────────────────────────────────────────┘
                │
                ├─── [Malformed / Exploit Flagged] ──> [DROP / INJECT FALSE REJECTION RESPONSE]
                │
                ▼ [Validation Cleared]
[Sanitized MCP Runtime Execution Frame] ──> [System Tool Handler / Local Process Host]
```

### 3. AUTOMATED VALIDATION LAYER (IMPLEMENTATION ENGINE)

The agent utilizes an explicit validation mechanism to process outgoing `tools/call` schemas. It intercepts parameters, checks value boundaries, and drops command injection syntax before compilation into a runtime container.

```python
import json
import re
from typing import Dict, Any, Tuple

class MCPAuditorAgent:
    def __init__(self):
        self.agent_id = "AGENT-03-MCP-AUDIT"
        # Rule definitions to match common argument injection signatures
        self.block_patterns = [
            re.compile(r"(\.\./|\.\.\\)"), # Path traversal
            re.compile(r"[;|&&|\\|\\|]"),    # Command sequencing tokens
            re.compile(r"(?i)(system\\s+prompt|ignore\\s+previous)") # Linguistic escape patterns
        ]

    def sanitize_string_payload(self, raw_input: str) -> Tuple[str, bool]:
        """Scans individual parameter strings for compliance violations."""
        for pattern in self.block_patterns:
            if pattern.search(raw_input):
                return "CRITICAL_BLOCKED_PARAMETER", True
        return raw_input, False

    def inspect_mcp_tool_call(self, rpc_envelope: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses an incoming Model Context Protocol tools/call structure.
        Ensures strict compliance with expected RPC transport layers.
        """
        if rpc_envelope.get("jsonrpc") != "2.0" or "method" not in rpc_envelope:
            return {"jsonrpc": "2.0", "id": rpc_envelope.get("id"), "error": {"code": -32600, "message": "Invalid Request"}}

        params = rpc_envelope.get("params", {})
        tool_arguments = params.get("arguments", {})
        sanitized_arguments = {}
        breach_detected = False

        for key, val in tool_arguments.items():
            if isinstance(val, str):
                cleaned_val, flagged = self.sanitize_string_payload(val)
                if flagged:
                    breach_detected = True
                sanitized_arguments[key] = cleaned_val
            else:
                sanitized_arguments[key] = val

        if breach_detected:
            return {
                "jsonrpc": "2.0",
                "id": rpc_envelope.get("id"),
                "result": {
                    "isError": True,
                    "content": [{"type": "text", "text": "MCP_AUDIT_VIOLATION: Payload blocked due to structural validation rules."}]
                }
            }

        rpc_envelope["params"]["arguments"] = sanitized_arguments
        return rpc_envelope
```

### 4. TRANSPORT SCHEMA ENFORCEMENT RULES (JSON SCHEMA)

All outbound data passing out of Phase 03.5 into execution layers must conform to this interface validator.

```json
{
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"title": "MCP_Sanitized_Frame",
	"type": "object",
	"required": ["jsonrpc", "id", "method", "params"],
	"properties": {
		"jsonrpc": { "type": "string", "const": "2.0" },
		"id": { "type": ["integer", "string"] },
		"method": { "type": "string", "enum": ["tools/call", "resources/read"] },
		"params": {
			"type": "object",
			"required": ["name", "arguments"],
			"properties": {
				"name": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
				"arguments": {
					"type": "object",
					"additionalProperties": {
						"type": ["string", "number", "boolean"],
						"not": { "enum": ["CRITICAL_BLOCKED_PARAMETER"] }
					}
				}
			}
		}
	}
}
```
