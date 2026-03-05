/**
 * Dark Factory - Main Export
 * The code generation pipeline that builds itself
 */

export { parseIntent, estimateComplexity } from './core/intent/parser';
export { generateSchemas, schemaToPrismaString } from './core/schema/generator';
export type { GeneratedSchema, PrismaModelDef, ApiEndpointDef, TypeDefinition } from './core/schema/generator';
export { generateApiRoutes } from './generators/api/route-generator';
export type { GeneratedRoute } from './generators/api/route-generator';
export { generatePrismaSchemaSection, generateTypeScriptTypes } from './generators/database/prisma-generator';
export { generateApiTests } from './generators/tests/test-generator';
export type { GeneratedTest } from './generators/tests/test-generator';
export { DarkFactoryPipeline, runDarkFactory, getTaskStatus } from './core/orchestrator/pipeline';
export type { PipelineResult } from './core/orchestrator/pipeline';
