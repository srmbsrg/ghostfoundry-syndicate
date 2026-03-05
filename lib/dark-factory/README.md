# Dark Factory

> The code generation pipeline that builds itself.

## Overview

The Dark Factory is an autonomous code generation system that:
1. Accepts natural language requests
2. Parses intent and extracts structured specifications
3. Generates production-ready code (APIs, UI, DB models, tests)
4. Validates and tests the generated code
5. Deploys approved artifacts to target environments

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DARK FACTORY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │    INTENT    │───▶│    SCHEMA    │───▶│     CODE     │       │
│  │    PARSER    │    │   GENERATOR  │    │   GENERATOR  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                    ORCHESTRATOR                       │       │
│  │    (Coordinates all stages, manages state, queues)    │       │
│  └──────────────────────────────────────────────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │     TEST     │───▶│   VALIDATOR  │───▶│   DEPLOYER   │       │
│  │   GENERATOR  │    │              │    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GENERATED OUTPUT                            │
│  • API Routes (app/api/*)                                        │
│  • Prisma Models (prisma/schema.prisma)                         │
│  • React Components (components/*)                               │
│  • TypeScript Types (lib/types/*)                                │
│  • Test Files (*.test.ts)                                        │
│  • Agent Definitions (lib/gfs/agents/*)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
lib/dark-factory/
├── core/
│   ├── intent/          # Natural language → structured spec
│   ├── schema/          # Spec → DB/API schemas
│   └── orchestrator/    # Pipeline coordination
├── generators/
│   ├── api/             # API route generation
│   ├── ui/              # React component generation
│   ├── database/        # Prisma model generation
│   └── tests/           # Test file generation
├── validators/          # Code validation & testing
├── deployers/           # Artifact deployment
├── templates/           # Code templates & patterns
└── queue/               # Job queue management
```

## Usage

```typescript
import { DarkFactory } from '@/lib/dark-factory';

// Submit a generation request
const result = await DarkFactory.generate({
  prompt: "Create an API endpoint that tracks customer orders with status updates",
  context: {
    businessDomain: 'operations',
    targetEnvironment: 'dev'
  }
});

// Check status
const status = await DarkFactory.getTaskStatus(result.taskId);

// Deploy when ready
if (status.canDeploy) {
  await DarkFactory.deploy(result.taskId, 'staging');
}
```

## API Endpoints

- `POST /api/dark-factory/generate` - Submit generation request
- `GET /api/dark-factory/status/:taskId` - Get task status
- `POST /api/dark-factory/validate/:taskId` - Trigger validation
- `POST /api/dark-factory/deploy/:taskId` - Deploy artifacts
- `GET /api/dark-factory/tasks` - List all tasks

## Redis Queues

- `df:queue:generation` - Pending generation jobs
- `df:queue:validation` - Pending validation jobs
- `df:queue:deployment` - Pending deployment jobs
- `df:events` - Event stream for real-time updates

## Self-Reference

The Dark Factory's ultimate test: **generating GFS itself**. Once operational, we feed it the GFS specification and let it build the Ghost Factory Syndicate product.
