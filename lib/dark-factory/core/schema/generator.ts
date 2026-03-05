/**
 * Schema Generator
 * Transforms parsed intents into concrete database and API schemas
 */

import { ParsedIntent, ExtractedEntity } from '@/lib/types/dark-factory';

export interface GeneratedSchema {
  prismaModels: PrismaModelDef[];
  apiEndpoints: ApiEndpointDef[];
  typeDefinitions: TypeDefinition[];
}

export interface PrismaModelDef {
  name: string;
  fields: PrismaField[];
  indexes?: string[];
  relations?: PrismaRelation[];
}

export interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isArray: boolean;
  defaultValue?: string;
  attributes?: string[];
}

export interface PrismaRelation {
  fieldName: string;
  targetModel: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  foreignKey?: string;
}

export interface ApiEndpointDef {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requestBody?: Record<string, string>;
  responseType: string;
  requiresAuth: boolean;
}

export interface TypeDefinition {
  name: string;
  properties: Record<string, string>;
  isExported: boolean;
}

const TYPE_MAPPINGS: Record<string, string> = {
  // Common type mappings from natural language to Prisma types
  'string': 'String',
  'text': 'String @db.Text',
  'number': 'Int',
  'integer': 'Int',
  'int': 'Int',
  'float': 'Float',
  'decimal': 'Decimal',
  'boolean': 'Boolean',
  'bool': 'Boolean',
  'date': 'DateTime',
  'datetime': 'DateTime',
  'timestamp': 'DateTime',
  'json': 'Json',
  'object': 'Json',
  'array': 'Json',
  'email': 'String',
  'url': 'String',
  'uuid': 'String @default(cuid())',
  'id': 'String @id @default(cuid())',
  'money': 'Decimal',
  'currency': 'Decimal',
  'status': 'String',
  'enum': 'String',
};

export async function generateSchemas(intent: ParsedIntent): Promise<GeneratedSchema> {
  const prismaModels: PrismaModelDef[] = [];
  const apiEndpoints: ApiEndpointDef[] = [];
  const typeDefinitions: TypeDefinition[] = [];

  for (const entity of intent.entities) {
    if (entity.type === 'model') {
      const prismaModel = generatePrismaModel(entity, intent.entities);
      prismaModels.push(prismaModel);
      
      // Generate CRUD endpoints for models
      const endpoints = generateCrudEndpoints(entity);
      apiEndpoints.push(...endpoints);
      
      // Generate TypeScript type
      const typeDef = generateTypeDefinition(entity);
      typeDefinitions.push(typeDef);
    } else if (entity.type === 'endpoint') {
      const endpoint = generateCustomEndpoint(entity);
      apiEndpoints.push(endpoint);
    }
  }

  return {
    prismaModels,
    apiEndpoints,
    typeDefinitions,
  };
}

function generatePrismaModel(entity: ExtractedEntity, allEntities: ExtractedEntity[]): PrismaModelDef {
  const fields: PrismaField[] = [
    // Always include id, createdAt, updatedAt
    { name: 'id', type: 'String', isOptional: false, isArray: false, attributes: ['@id', '@default(cuid())'] },
  ];

  // Process entity properties
  for (const [propName, propType] of Object.entries(entity.properties)) {
    const field = parsePropertyToField(propName, propType);
    // Don't duplicate id field
    if (field.name !== 'id') {
      fields.push(field);
    }
  }

  // Add timestamps if not already present
  if (!fields.some(f => f.name === 'createdAt')) {
    fields.push({ name: 'createdAt', type: 'DateTime', isOptional: false, isArray: false, attributes: ['@default(now())'] });
  }
  if (!fields.some(f => f.name === 'updatedAt')) {
    fields.push({ name: 'updatedAt', type: 'DateTime', isOptional: false, isArray: false, attributes: ['@updatedAt'] });
  }

  // Generate relations
  const relations: PrismaRelation[] = [];
  for (const rel of entity.relationships) {
    const relation = generateRelation(entity.name, rel.targetEntity, rel.type);
    relations.push(relation);
    
    // Add relation field
    if (rel.type === 'belongs_to' || rel.type === 'has_one') {
      fields.push({
        name: `${toCamelCase(rel.targetEntity)}Id`,
        type: 'String',
        isOptional: rel.type === 'has_one',
        isArray: false,
      });
      fields.push({
        name: toCamelCase(rel.targetEntity),
        type: rel.targetEntity,
        isOptional: rel.type === 'has_one',
        isArray: false,
        attributes: [`@relation(fields: [${toCamelCase(rel.targetEntity)}Id], references: [id])`],
      });
    } else if (rel.type === 'has_many') {
      fields.push({
        name: toCamelCase(rel.targetEntity) + 's',
        type: rel.targetEntity,
        isOptional: true,
        isArray: true,
      });
    }
  }

  return {
    name: entity.name,
    fields,
    relations,
    indexes: generateIndexes(fields),
  };
}

function parsePropertyToField(name: string, typeInfo: unknown): PrismaField {
  const typeStr = String(typeInfo).toLowerCase();
  
  // Check if optional (contains '?' or 'optional')
  const isOptional = typeStr.includes('?') || typeStr.includes('optional');
  const isArray = typeStr.includes('[]') || typeStr.includes('array of');
  
  // Clean up type string
  const cleanType = typeStr
    .replace('?', '')
    .replace('optional', '')
    .replace('[]', '')
    .replace('array of', '')
    .trim();
  
  // Map to Prisma type
  let prismaType = TYPE_MAPPINGS[cleanType] || 'String';
  
  // Handle special field names
  if (name.toLowerCase().includes('email')) prismaType = 'String';
  if (name.toLowerCase().includes('price') || name.toLowerCase().includes('amount') || name.toLowerCase().includes('cost')) {
    prismaType = 'Decimal';
  }
  if (name.toLowerCase().includes('count') || name.toLowerCase().includes('quantity')) {
    prismaType = 'Int';
  }
  if (name.toLowerCase().includes('date') || name.toLowerCase().includes('at')) {
    prismaType = 'DateTime';
  }
  if (name.toLowerCase() === 'status') prismaType = 'String';
  if (name.toLowerCase().includes('is') || name.toLowerCase().includes('has')) {
    prismaType = 'Boolean';
  }
  
  return {
    name: toCamelCase(name),
    type: prismaType.split(' ')[0], // Get base type without attributes
    isOptional,
    isArray,
    attributes: prismaType.includes('@') ? [prismaType.split(' ').slice(1).join(' ')] : undefined,
  };
}

function generateRelation(
  sourceModel: string,
  targetModel: string,
  relationType: string
): PrismaRelation {
  const typeMap: Record<string, PrismaRelation['type']> = {
    'has_many': 'one-to-many',
    'belongs_to': 'many-to-one',
    'has_one': 'one-to-one',
    'many_to_many': 'many-to-many',
  };
  
  return {
    fieldName: toCamelCase(targetModel),
    targetModel,
    type: typeMap[relationType] || 'one-to-many',
    foreignKey: relationType === 'belongs_to' ? `${toCamelCase(targetModel)}Id` : undefined,
  };
}

function generateIndexes(fields: PrismaField[]): string[] {
  const indexes: string[] = [];
  
  for (const field of fields) {
    // Index foreign keys and common query fields
    if (field.name.endsWith('Id') && field.name !== 'id') {
      indexes.push(`@@index([${field.name}])`);
    }
    if (field.name === 'status' || field.name === 'type') {
      indexes.push(`@@index([${field.name}])`);
    }
  }
  
  return indexes;
}

function generateCrudEndpoints(entity: ExtractedEntity): ApiEndpointDef[] {
  const basePath = `/api/${toKebabCase(entity.name)}`;
  const entityName = entity.name;
  
  return [
    {
      path: basePath,
      method: 'GET',
      description: `List all ${entityName} records`,
      responseType: `${entityName}[]`,
      requiresAuth: false,
    },
    {
      path: basePath,
      method: 'POST',
      description: `Create a new ${entityName}`,
      requestBody: Object.fromEntries(
        Object.entries(entity.properties).map(([k, v]) => [k, String(v)])
      ),
      responseType: entityName,
      requiresAuth: true,
    },
    {
      path: `${basePath}/[id]`,
      method: 'GET',
      description: `Get a single ${entityName} by ID`,
      responseType: entityName,
      requiresAuth: false,
    },
    {
      path: `${basePath}/[id]`,
      method: 'PUT',
      description: `Update a ${entityName}`,
      requestBody: Object.fromEntries(
        Object.entries(entity.properties).map(([k, v]) => [k, String(v)])
      ),
      responseType: entityName,
      requiresAuth: true,
    },
    {
      path: `${basePath}/[id]`,
      method: 'DELETE',
      description: `Delete a ${entityName}`,
      responseType: '{ success: boolean }',
      requiresAuth: true,
    },
  ];
}

function generateCustomEndpoint(entity: ExtractedEntity): ApiEndpointDef {
  const props = entity.properties as Record<string, unknown>;
  
  return {
    path: `/api/${toKebabCase(entity.name)}`,
    method: (String(props.method || 'GET').toUpperCase() as ApiEndpointDef['method']),
    description: String(props.description || `${entity.name} endpoint`),
    requestBody: props.requestBody as Record<string, string> | undefined,
    responseType: String(props.responseType || 'unknown'),
    requiresAuth: Boolean(props.requiresAuth),
  };
}

function generateTypeDefinition(entity: ExtractedEntity): TypeDefinition {
  const properties: Record<string, string> = {
    id: 'string',
  };
  
  for (const [propName, propType] of Object.entries(entity.properties)) {
    properties[toCamelCase(propName)] = mapToTsType(String(propType));
  }
  
  properties.createdAt = 'Date';
  properties.updatedAt = 'Date';
  
  return {
    name: entity.name,
    properties,
    isExported: true,
  };
}

function mapToTsType(prismaType: string): string {
  const mapping: Record<string, string> = {
    'string': 'string',
    'text': 'string',
    'number': 'number',
    'integer': 'number',
    'int': 'number',
    'float': 'number',
    'decimal': 'number',
    'boolean': 'boolean',
    'bool': 'boolean',
    'date': 'Date',
    'datetime': 'Date',
    'json': 'Record<string, unknown>',
    'object': 'Record<string, unknown>',
  };
  
  return mapping[prismaType.toLowerCase()] || 'string';
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function schemaToPrismaString(model: PrismaModelDef): string {
  const lines: string[] = [`model ${model.name} {`];
  
  for (const field of model.fields) {
    let line = `  ${field.name} `;
    line += field.isArray ? `${field.type}[]` : field.type;
    if (field.isOptional) line += '?';
    if (field.attributes?.length) {
      line += ' ' + field.attributes.join(' ');
    }
    lines.push(line);
  }
  
  if (model.indexes?.length) {
    lines.push('');
    for (const index of model.indexes) {
      lines.push(`  ${index}`);
    }
  }
  
  lines.push('}');
  return lines.join('\n');
}
