import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../src/services/frontend-repository.js';
import { conferences } from '../src/fixtures/demo-conferences.js';
import { defaultProfile } from '../src/fixtures/demo-profile.js';
import { listMarkup } from '../src/views/conference-catalog.js';
import { conferenceDetail } from '../src/views/conference-detail-dialog.js';
import { profilePage } from '../src/views/profile-page.js';

test('HTTP-контракт загрузки и изменений', async () => {
  const calls = [];
  const get = {
    '/api/conferences': conferences,
    '/api/me': defaultProfile,
    '/api/me/favorites': ['conf-1'],
  };
  const repository = createRepository('/api/', async (path, options) => {
    const method = options.method || 'GET';
    calls.push([method, path]);
    assert.equal(options.credentials, 'same-origin');
    if (method === 'GET') return Response.json(get[path]);
    if (method === 'PATCH') {
      assert.deepEqual(JSON.parse(options.body), { city: 'Пермь' });
      return Response.json({ ...defaultProfile, city: 'Пермь' });
    }
    return new Response(null, { status: 204 });
  });
  const result = await repository.load();
  assert.deepEqual(result, { conferences, profile: defaultProfile, favorites: ['conf-1'] });
  assert.equal((await repository.updateProfile({ city: 'Пермь' })).city, 'Пермь');
  await repository.setFavorite('id/2', true);
  await repository.setFavorite('id/2', false);
  assert.deepEqual(calls.slice(3), [
    ['PATCH', '/api/me'], ['PUT', '/api/me/favorites/id%2F2'], ['DELETE', '/api/me/favorites/id%2F2'],
  ]);
});

test('Ошибка сервера и неверная схема не превращаются в успешное сохранение или пустой каталог', async () => {
  const offline = createRepository('/api', async () => new Response(null, { status: 503 }));
  await assert.rejects(offline.setFavorite('conf-1', true), /503/);
  const malformed = createRepository('/api', async () => Response.json({}));
  await assert.rejects(malformed.load());
});

test('Последняя страница и неполная группа номеров', () => {
  const state = { conferences, filters: {}, favorites: [], page: 3, pageStart: 1, home: false };
  const html = listMarkup(state);
  assert.equal((html.match(/class="conference-card"/g) || []).length, 4);
  assert.match(html, /data-action="shift-pages" disabled/);
  const next = listMarkup({ ...state, conferences: [...conferences, ...conferences], pageStart: 5 });
  assert.match(next, /data-page="6"/);
  assert.doesNotMatch(next, /data-page="7"/);
});

test('Пустое участие и данные конференции из внешнего API', () => {
  assert.match(profilePage(defaultProfile, 'upcoming', [], []), /Нет предстоящих/);
  const item = { ...conferences[0], title: '<script>', description: [{ text: '<img>', url:'javascript:alert(1)' }], participationUrl: 'javascript:alert(2)' };
  const html = conferenceDetail(item, []);
  assert.ok(html.includes('&lt;script&gt;') && html.includes('&lt;img&gt;'));
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /disabled/);
});
