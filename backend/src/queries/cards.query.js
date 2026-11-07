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

    if (min !== undefined) addFilter(`c.${column} >= $?`, min);
    if (max !== undefined) addFilter(`c.${column} <= $?`, max);
  }

  return {
    where: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    values,
  };
}

function getPagination(query) {
  const { page, limit } = query;
  return { page, limit, offset: (page - 1) * limit };
}

function paginationInfo(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { cardSelect, buildCardFilters, getPagination, paginationInfo };
