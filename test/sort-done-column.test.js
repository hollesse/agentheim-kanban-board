'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sortDoneColumn } = require('../lib/sort-done-column');

test('done column: tasks sorted newest-first by completed date', () => {
  const tasks = [
    { id: 'a', completed: '2026-01-01' },
    { id: 'b', completed: '2026-06-15' },
    { id: 'c', completed: '2026-03-10' },
  ];
  const result = sortDoneColumn(tasks);
  assert.deepEqual(result.map(t => t.id), ['b', 'c', 'a']);
});

test('done column: tasks without completed date fall to the bottom', () => {
  const tasks = [
    { id: 'a', completed: null },
    { id: 'b', completed: '2026-06-15' },
    { id: 'c', completed: null },
    { id: 'd', completed: '2026-03-10' },
  ];
  const result = sortDoneColumn(tasks);
  assert.deepEqual(result.map(t => t.id), ['b', 'd', 'a', 'c']);
});

test('done column: undated tasks preserve stable relative order', () => {
  const tasks = [
    { id: 'x', completed: null },
    { id: 'y', completed: null },
    { id: 'z', completed: null },
  ];
  const result = sortDoneColumn(tasks);
  assert.deepEqual(result.map(t => t.id), ['x', 'y', 'z']);
});

test('done column: empty array returns empty array', () => {
  const result = sortDoneColumn([]);
  assert.deepEqual(result, []);
});

test('done column: single task returned unchanged', () => {
  const tasks = [{ id: 'a', completed: '2026-06-19' }];
  const result = sortDoneColumn(tasks);
  assert.deepEqual(result.map(t => t.id), ['a']);
});
