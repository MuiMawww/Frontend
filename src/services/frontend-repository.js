import { RequestError } from './request-error.js';
import { readLocal, writeLocal } from './local-storage.js';

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
        import('../fixtures/demo-conferences.js'), import('../fixtures/demo-profile.js'),
      ]);
      currentProfile = { ...defaultProfile, ...readLocal('profile', {}) };
      const oldBio = 'Студент направления «Прикладная математика и информатика». Имею опыт с Java, C#, Python, SQL.';
      if (currentProfile.bio === oldBio) currentProfile.bio = defaultProfile.bio;
      return { conferences, profile: currentProfile, favorites: storedFavorites() };
    },
    async loadCatalog() { return (await this.load()).conferences; },
    async loadAccount() {
      const { profile, favorites } = await this.load();
      return { profile, favorites };
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
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new RequestError(response.status, body?.errors || {});
    }
    return response;
  }

  async function get(path) {
    return (await send(path)).json();
  }

  return {
    async loadCatalog() {
      const conferences = await get('/conferences');
      if (!Array.isArray(conferences) || !conferences.every(validateConference)) {
        throw new Error('Некорректный ответ каталога');
      }
      return conferences;
    },
    async loadAccount() {
      let profile;
      try {
        profile = validateProfile(await get('/me'));
      } catch (error) {
        if (error.status === 401) return { profile: null, favorites: [] };
        throw error;
      }
      const favorites = await get('/me/favorites');
      if (!strings(favorites)) throw new Error('Некорректный ответ избранного');
      return { profile, favorites };
    },
    async load() {
      const conferences = await this.loadCatalog();
      return { conferences, ...await this.loadAccount() };
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
