import test from 'node:test';
import assert from 'node:assert/strict';
import {conferences} from '../src/fixtures/conferences.js';
import {filterConferences, dateValue} from '../src/domain/conferences.js';
import {escapeHtml} from '../src/shared/html.js';

test('Поиск без учёта регистра и пробелов',()=>{
  const result=filterConferences(conferences,{query:'  МЕДИЦИНСКАЯ ВЕСНА  '});
  assert.equal(result.length,1);assert.equal(result[0].id,'conf-1');
});
test('Совместное применение направления, бесплатности и индексации',()=>{
  const result=filterConferences(conferences,{category:'Программирование',free:true,index:'ВАК'});
  assert.deepEqual(result.map(c=>c.id),['conf-7']);
});
test('Избранное не теряет фильтр поиска',()=>{
  assert.deepEqual(filterConferences(conferences,{favorites:true,query:'весна'},['conf-1','conf-2']).map(c=>c.id),['conf-1']);
  assert.equal(filterConferences(conferences,{favorites:true},[]).length,0);
});
test('Сортировка по датам пересекает границу года',()=>{
  const sorted=filterConferences(conferences,{sort:'date'});
  assert.equal(sorted[0].deadline,'05.11.2026');
  assert.equal(sorted.at(-1).deadline,'10.03.2027');
  assert.ok(dateValue('10.03.2027')>dateValue('25.11.2026'));
  assert.equal(conferences[0].id,'conf-1');
});
test('Пустой результат и экранирование текста профиля',()=>{
  assert.equal(filterConferences(conferences,{category:'Архитектура'}).length,0);
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
