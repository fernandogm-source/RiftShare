const MAX_LIMIT = 100;
const NUMERIC_FILTERS = ['might', 'energy', 'power'];

function cardSelect(extraColumns = '', extraJoin = '') {
  return `
    SELECT c.*, ${extraColumns}
      s.label AS set_label,
      COALESCE((
        SELECT json_agg(d.name ORDER BY d.name)
        FROM card_domains cd
        JOIN domains d ON d.id = cd.domain_id
        WHERE cd.card_id = c.id
      ), '[]') AS domains,
      COALESCE((
        SELECT json_agg(t.name ORDER BY t.name)
        FROM card_tags ct
        JOIN tags t ON t.id = ct.tag_id
        WHERE ct.card_id = c.id
      ), '[]') AS tags
    FROM cards c
    JOIN sets s ON s.set_id = c.set_id
    ${extraJoin}
  `;
}

function validationError(message) {
  const error = new Error(message);
  error.isValidation = true;
  return error;
}

function parseIntegerParam(value, name) {
  if (typeof value !== 'string' || !/^-?\d+$/.test(value)) {
    throw validationError(`${name} debe ser un número entero`);
  }
  return Number(value);
}

function buildCardFilters(query) {
  const { name, set, rarity, type, domain } = query;
  const filters = [];
  const values = [];

  const addFilter = (sql, value) => {
    values.push(value);
    filters.push(sql.replace('$?', `$${values.length}`));
  };

  if (name) addFilter('c.name ILIKE $?', `%${name}%`);
  if (set) addFilter('c.set_id = $?', set);
  if (rarity) addFilter('c.rarity = $?', rarity);
  if (type) addFilter('c.card_type = $?', type);
  if (domain) {
    addFilter(
      `EXISTS (
        SELECT 1 FROM card_domains cd
        JOIN domains d ON d.id = cd.domain_id
        WHERE cd.card_id = c.id AND d.name = $?
      )`,
      domain
    );
  }

  for (const column of NUMERIC_FILTERS) {
    const min = query[`${column}_min`];
    const max = query[`${column}_max`];
    const minValue = min === undefined ? undefined : parseIntegerParam(min, `${column}_min`);
    const maxValue = max === undefined ? undefined : parseIntegerParam(max, `${column}_max`);

    if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
      throw validationError(`${column}_min no puede ser mayor que ${column}_max`);
    }
    if (minValue !== undefined) addFilter(`c.${column} >= $?`, minValue);
    if (maxValue !== undefined) addFilter(`c.${column} <= $?`, maxValue);
  }

  return {
    where: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    values,
  };
}

function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), MAX_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
}

function paginationInfo(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { cardSelect, buildCardFilters, getPagination, paginationInfo };