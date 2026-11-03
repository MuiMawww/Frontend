import { readLocal, writeLocal } from './storage.js';

const isString = value => typeof value === 'string';
const strings = value => Array.isArray(value) && value.every(isString);
const profileFields = [
  'id', 'name', 'degree', 'email', 'phone', 'telegram', 'age', 'city',
  'bio', 'education', 'specialty', 'job', 'interests',
];

function validateProfile(profile) {
  if (!profile || !profileFields.every(key => isString(profile[key])) ||
      !strings(profile.participatingIds) ||
      (profile.achievements != null && (!Array.isArray(profile.achievements) ||
        !profile.achievements.every(item => item && isString(item.title)))) ||
      (profile.teams != null && (!Array.isArray(profile.teams) ||
        !profile.teams.every(item => item && isString(item.name))))) {
    throw new Error('Некорректный ответ /me');
  }
  return profile;
}

function validateConference(item) {
  const fields = ['id', 'title', 'category', 'cost', 'format', 'deadline'];
  return item && fields.every(key => isString(item[key])) && strings(item.indexes) &&
    (item.description == null || (Array.isArray(item.description) &&
      item.description.every(paragraph => paragraph && isString(paragraph.text))));
}

function storedFavorites() {
  const ids = readLocal('favorites', []);
  return strings(ids) ? ids : [];
}

function persist(key, value) {
  if (!writeLocal(key, value)) throw new Error('Сохранение недоступно');
}

function demoRepository() {
  let currentProfile;
  return {
    async load() {
      const [{ conferences }, { defaultProfile }] = await Promise.all([
        import('../fixtures/conferences.js'), import('../fixtures/profile.js'),
      ]);
      currentProfile = { ...defaultProfile, ...readLocal('profile', {}) };
      const oldBio = 'Студент направления «Прикладная математика и информатика». Имею опыт с Java, C#, Python, SQL.';
      if (currentProfile.bio === oldBio) currentProfile.bio = defaultProfile.bio;
      return { conferences, profile: currentProfile, favorites: storedFavorites() };
    },
    async updateProfile(changes) {
      const updated = { ...currentProfile, ...changes };
      persist('profile', updated);
      currentProfile = updated;
      return updated;
    },
    async setFavorite(id, selected) {
      const ids = new Set(storedFavorites());
      if (selected) ids.add(id);
      else ids.delete(id);
      persist('favorites', [...ids]);
    },
  };
}

export function createRepository(base, request = fetch) {
  if (!base) return demoRepository();
  const prefix = base.replace(/\/$/, '');

  async function send(path, options = {}) {
    const response = await request(prefix + path, {
      credentials: 'same-origin',
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} для ${path}`);
    return response;
  }

  async function get(path) {
    return (await send(path)).json();
  }

  return {
    async load() {
      const [conferences, profile, favorites] = await Promise.all([
        get('/conferences'), get('/me'), get('/me/favorites'),
      ]);
      if (!Array.isArray(conferences) || !conferences.every(validateConference) || !strings(favorites)) {
        throw new Error('Некорректный ответ каталога или избранного');
      }
      return { conferences, favorites, profile: validateProfile(profile) };
    },
    async updateProfile(changes) {
      const response = await send('/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      return validateProfile(await response.json());
    },
    async setFavorite(id, selected) {
      await send('/me/favorites/' + encodeURIComponent(id), {
        method: selected ? 'PUT' : 'DELETE',
      });
    },
  };
}
