# Amazon Connect MCP Server

A production-ready [Model Context Protocol](https://modelcontextprotocol.io) server that enables any AI agent to interact with Amazon Connect for automated voice calls, SMS, chat, and appointment management.

## Quick Start

### 1. Install

```bash
npx amazon-connect-mcp-server init --profile default --region us-east-1
```

This will:
- Validate your AWS credentials
- Discover or prompt you to create an Amazon Connect instance
- Save configuration to `~/.amazon-connect-mcp/config.json`
- Print the MCP client config to add to Claude Desktop, Cursor, Cline, etc.

### 2. Configure Your AI Client

Add the printed JSON block to your MCP client configuration:

**Claude Desktop** (`~/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "amazon-connect": {
      "command": "npx",
      "args": ["amazon-connect-mcp-server", "serve"],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

### 3. Use the Tools

Once connected, your AI agent can:

### Communication
- **make_call** - Place an outbound voice call with a TTS message
- **send_sms** - Send SMS reminders via Amazon SNS
- **start_chat** - Start a chat session
- **schedule_callback** - Schedule a callback at a specific time
- **transfer_to_agent** - Transfer an active contact to a human agent queue

### Bedrock AgentCore (Autonomous AI Agents)
- **create_bedrock_agent** - Create a Bedrock AgentCore agent for full conversations
- **invoke_bedrock_agent** - Trigger an autonomous agent to call and converse
- **list_bedrock_agents** - List configured Bedrock agents

### Connect Native AI (Agent Assistance)
- **create_connect_ai_agent** - Create an Amazon Q in Connect AI agent
- **list_connect_ai_agents** - List native AI agents by assistant
- **update_connect_ai_agent** - Publish or set defaults for native AI agents

### Appointments & Reminders
- **schedule_reminder** - Schedule an outbound reminder call or SMS
- **book_appointment** - Book an appointment and optionally send confirmation
- **confirm_appointment** - Call to confirm an existing appointment
- **cancel_appointment** - Call to cancel an appointment

### Instance Management
- **get_instance_status** - Check your Connect instance health
- **list_contact_flows** - List available contact flows
- **list_phone_numbers** - List claimed phone numbers
- **get_metrics** - Get real-time queue metrics

Example:
```
User: "Call Mike at +1-555-123-4567 and remind him about his appointment tomorrow."
Agent: (invokes make_call)
```

## Architecture

```
AI Agent (Claude, GPT, etc.)
    ↓ MCP Protocol (stdio)
Amazon Connect MCP Server (Node.js/TypeScript)
    ↓ AWS SDK
Amazon Connect Instance
    ├── Contact Flows (voice/chat)
    ├── Queues & Routing
    └── Outbound Campaigns
```

## Supported AI Agent Platforms

This MCP server supports **both** types of AWS AI agents, and they can work together:

| Feature | Bedrock AgentCore | Amazon Connect Native AI (Amazon Q) |
|---------|-------------------|-------------------------------------|
| Use case | Autonomous voice/chat conversations, tool use | Speech-to-speech, self-service, agent assistance, orchestration |
| API | `bedrock-agent` | `qconnect` |
| Handles full calls | Yes | Yes (speech-to-speech, self-service) |
| 3rd party agents | Yes (native) | Yes (via Bedrock AgentCore Gateways) |
| Requires | Bedrock AgentCore Gateway | Amazon Q in Connect license |

**Key insight:** Amazon Q in Connect is not just for agent assistance. It supports speech-to-speech self-service conversations (no human agent needed) and can invoke 3rd party Bedrock AgentCore agents via Gateways. Use Bedrock AgentCore for complex tool-based workflows, and Connect native AI for speech-to-speech and self-service use cases.

## Requirements

- Node.js 18+
- AWS account with Amazon Connect enabled
- IAM permissions for `connect:*`, `sns:Publish`, `sts:GetCallerIdentity`

## Development

```bash
git clone https://github.com/timmy-t-bot/amazon-connect-mcp-agent.git
npm install
npm run build
npm run dev
```

## License

MIT
