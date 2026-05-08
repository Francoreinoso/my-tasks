import { describe, it, expect } from 'vitest';
import type { DragEndEvent } from '@dnd-kit/core';
import { resolveDropToUpdate } from './weekDnd';
import type { Task } from '@/types/task';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't-1',
    title: 'Tarea',
    description: null,
    dueDate: null,
    status: 'pending',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

function makeDragEvent(activeId: string, overId: string | null): DragEndEvent {
  return {
    active: { id: activeId, data: { current: undefined }, rect: { current: { initial: null, translated: null } } },
    over: overId ? { id: overId, data: { current: undefined }, rect: {} as unknown as DOMRect, disabled: false } : null,
    activatorEvent: new Event('mousedown'),
    collisions: null,
    delta: { x: 0, y: 0 },
  } as unknown as DragEndEvent;
}

describe('resolveDropToUpdate', () => {
  it('devuelve null si no hay over (drop fuera de zona)', () => {
    const tasks = [makeTask({ id: 'a' })];
    const event = makeDragEvent('a', null);
    expect(resolveDropToUpdate(event, tasks)).toBeNull();
  });

  it('devuelve null si la tarea no existe en la lista', () => {
    const tasks = [makeTask({ id: 'a' })];
    const event = makeDragEvent('no-existe', '2026-05-15');
    expect(resolveDropToUpdate(event, tasks)).toBeNull();
  });

  it('devuelve null si la tarea ya está en ese día (no-op)', () => {
    const tasks = [makeTask({ id: 'a', dueDate: '2026-05-15' })];
    const event = makeDragEvent('a', '2026-05-15');
    expect(resolveDropToUpdate(event, tasks)).toBeNull();
  });

  it('devuelve el update correcto al mover entre días', () => {
    const tasks = [makeTask({ id: 'a', dueDate: '2026-05-12' })];
    const event = makeDragEvent('a', '2026-05-15');
    expect(resolveDropToUpdate(event, tasks)).toEqual({
      taskId: 'a',
      input: { dueDate: '2026-05-15' },
    });
  });

  it('devuelve el update al asignar fecha a una tarea sin día previo', () => {
    const tasks = [makeTask({ id: 'a', dueDate: null })];
    const event = makeDragEvent('a', '2026-05-15');
    expect(resolveDropToUpdate(event, tasks)).toEqual({
      taskId: 'a',
      input: { dueDate: '2026-05-15' },
    });
  });
});
