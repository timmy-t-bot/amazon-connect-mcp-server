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

### AI Agents
- **create_ai_agent** - Create a Bedrock AgentCore agent
- **invoke_ai_agent** - Trigger an AI agent for a conversation
- **list_ai_agents** - List configured AI agents

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
