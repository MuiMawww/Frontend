export function filterConferences(records, filters = {}, favorites = []) {
  const query = (filters.query || '').trim().toLocaleLowerCase('ru');
  const aliases = { 'Программирование': 'IT и ИИ', 'Инженерия': 'Физика и инженерия' };
  const category = aliases[filters.category] || filters.category;
  const filtered = records.filter(item =>
    (!query || `${item.title} ${item.category} ${item.indexes.join(' ')}`.toLocaleLowerCase('ru').includes(query)) &&
    (!category || item.category === category) &&
    (!filters.format || item.format === filters.format) &&
    (!filters.free || item.cost === 'Бесплатно') &&
    (!filters.index || item.indexes.includes(filters.index)) &&
    (!filters.favorites || favorites.includes(item.id))
  );
  if (filters.sort === 'date') filtered.sort((a,b) => dateValue(a.deadline) - dateValue(b.deadline));
  return filtered;
}
export function dateValue(value) {
  const [d,m,y] = value.split('.').map(Number);
  return Date.UTC(y,m-1,d);
}
