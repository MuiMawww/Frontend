import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../src/services/frontend-repository.js';
import { createFavoritesController, syncFavoriteButtons } from '../src/features/favorites.js';
import { requestMessage } from '../src/services/request-error.js';
import { conferences } from '../src/fixtures/demo-conferences.js';
import { defaultProfile } from '../src/fixtures/demo-profile.js';

test('Гость получает каталог, избранное не запрашивается до входа', async () => {
  let signedIn = false;
  const calls = [];
  const repo = createRepository('/api', async url => {
    calls.push(url);
    if (url.endsWith('/conferences')) return Response.json(conferences);
    if (url.endsWith('/me')) return signedIn ? Response.json(defaultProfile) : new Response(null, {status:401});
    return Response.json(['conf-1']);
  });
  assert.deepEqual(await repo.loadCatalog(), conferences);
  assert.deepEqual(calls, ['/api/conferences']);
  assert.deepEqual(await repo.loadAccount(), {profile:null, favorites:[]});
  assert.ok(!calls.includes('/api/me/favorites'));
  signedIn = true;
  assert.deepEqual(await repo.loadAccount(), {profile:defaultProfile, favorites:['conf-1']});
});

test('Ошибка аккаунта не влияет на независимую загрузку каталога', async () => {
  const repo = createRepository('/api', async url => url.endsWith('/conferences') ? Response.json(conferences) : new Response(null, {status:503}));
  assert.deepEqual(await repo.loadCatalog(), conferences);
  await assert.rejects(repo.loadAccount(), error => error.status === 503);
});

test('Ошибки API сохраняют статус и сообщения полей', async () => {
  const repo = createRepository('/api', async () => Response.json({errors:{email:'Проверьте почту'}}, {status:422}));
  await assert.rejects(repo.updateProfile({email:'bad'}), error => error.status === 422 && error.fields.email === 'Проверьте почту');
  assert.match(requestMessage({status:401}), /войдите/);
  assert.match(requestMessage({status:403}), /прав/);
  assert.match(requestMessage({status:503}), /Сервер/);
});

test('Разные звёзды сохраняются параллельно, повторный клик заблокирован, ошибка освобождает ID', async () => {
  let favorites = [];
  const operations = new Map();
  const errors = [];
  const controller = createFavoritesController({
    repository: {setFavorite: id => new Promise((resolve,reject) => operations.set(id,{resolve,reject}))},
    getFavorites: () => favorites,
    setFavorites: value => { favorites = value; },
    changed: () => {}, failed: error => errors.push(error),
  });
  const first = controller.toggle('a');
  const second = controller.toggle('b');
  await controller.toggle('a');
  assert.equal(operations.size,2);
  operations.get('b').resolve();
  await second;
  operations.get('a').resolve();
  await first;
  assert.deepEqual(favorites.sort(),['a','b']);
  const failed = controller.toggle('a');
  operations.get('a').reject(new Error('offline'));
  await failed;
  assert.deepEqual(favorites.sort(),['a','b']);
  assert.equal(controller.pending.size,0);
  assert.equal(errors.length,1);
});

test('Перерисованные кнопки и другое открытое окно синхронизируются по ID', () => {
  const button = id => ({dataset:{favorite:id},classList:{toggle(){}}, attributes:{},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];}});
  const a=button('a'), b=button('b'), copy=button('a');
  syncFavoriteButtons({querySelectorAll:()=>[a,b,copy]},['a'],new Set(['b']));
  assert.equal(a.attributes['aria-pressed'],'true');
  assert.equal(copy.attributes['aria-pressed'],'true');
  assert.equal(b.attributes['aria-pressed'],'false');
  assert.equal(b.disabled,true);
});
