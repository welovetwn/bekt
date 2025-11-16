// src/utils/swaggerParser.js
export function parseSwagger(swaggerJson) {
  const entities = [];
  const paths = swaggerJson.paths || {};

  for (const [path, methods] of Object.entries(paths)) {
    if (!path.startsWith('/api/')) continue;

    const segments = path.split('/').filter(Boolean);
    if (segments.length < 2) continue;

    const controller = segments[1];
    const entityName = controller.replace(/s$/i, '');
    const lowerName = entityName.toLowerCase();

    const hasGetAll = !!methods.get && !path.includes('{');
    const hasGetById = !!methods.get && path.includes('{id}');
    const hasPost = !!methods.post && !path.includes('{');
    const hasPut = !!methods.put && path.includes('{id}');
    const hasDelete = !!methods.delete && path.includes('{id}');

    if (!hasGetAll) continue;

    let properties = {};
    const getResponse = methods.get?.responses?.['200'];
    const schema = getResponse?.schema || getResponse?.content?.['application/json']?.schema;
    if (schema) {
      properties = extractProperties(schema, swaggerJson);
    }

    entities.push({
      name: entityName,
      controller,
      lowerName,
      apiPath: `/api/${controller}`,
      properties,
      hasGetAll,
      hasGetById,
      hasPost,
      hasPut,
      hasDelete,
    });
  }

  return entities;
}

function extractProperties(schema, swaggerJson) {
  const ref = schema.$ref || schema.items?.$ref;
  if (!ref) return {};

  const defName = ref.split('/').pop();
  const definitions = swaggerJson.definitions || swaggerJson.components?.schemas || {};
  const def = definitions[defName];
  if (!def) return {};

  const props = {};
  for (const [key, prop] of Object.entries(def.properties || {})) {
    // ⭐ 核心變動: 在這裡提取 x-display-name
    const displayName = prop['x-display-name'] || key; 
    
    props[key] = {
      // ⭐ 新增: 將中文名稱儲存在 displayName 屬性中
      displayName: displayName, 
      type: mapType(prop.type, prop.format),
      required: def.required?.includes(key) || false,
    };
  }
  return props;
}

function mapType(type, format) {
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'string') {
    if (format === 'date-time') return 'date';
    return 'string';
  }
  if (type === 'boolean') return 'boolean';
  return 'string';
}