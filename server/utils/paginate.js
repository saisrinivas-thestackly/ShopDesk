export function readPageParams(query, defaultLimit = 10, maxLimit = 1000) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Number.parseInt(query.limit, 10) || defaultLimit;
  return { page, limit: Math.min(Math.max(1, limit), maxLimit) };
}

export async function findPage(Model, filter, { page, limit, sort = { createdAt: -1 } }) {
  const total = await Model.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  const items = await Model.find(filter)
    .sort(sort)
    .skip((safePage - 1) * limit)
    .limit(limit);

  return { items, page: safePage, limit, total, totalPages };
}
