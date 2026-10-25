import { errors } from '@strapi/utils';
import { readDocumentId } from './read-query';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new errors.ValidationError('Expected a JSON object.');
  }
  return value as Record<string, unknown>;
}

function dataInput(body: unknown, fields: string[]): Record<string, unknown> {
  const envelope = object(body);
  for (const field of Object.keys(envelope)) {
    if (field !== 'data') throw new errors.ValidationError(`Unsupported field: ${field}`, { field });
  }
  const data = object(envelope.data);
  for (const field of Object.keys(data)) {
    if (!fields.includes(field)) throw new errors.ValidationError(`Unsupported field: ${field}`, { field });
  }
  return data;
}

function text(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string') {
    throw new errors.ValidationError(`${field} must be text.`, { field });
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new errors.ValidationError(`${field} must contain ${min}-${max} characters after trimming.`, { field });
  }
  return trimmed;
}

export type DiscussionInput = { title: string; content: string; type: 'question' | 'discussion'; category: string };

export function discussionInput(body: unknown): DiscussionInput {
  const data = dataInput(body, ['title', 'content', 'type', 'category']);
  const title = text(data.title, 'title', 10, 255);
  const content = text(data.content, 'content', 1, 50_000);
  if (data.type !== 'question' && data.type !== 'discussion') {
    throw new errors.ValidationError('type must be question or discussion.', { field: 'type' });
  }
  return { title, content, type: data.type, category: readDocumentId(data.category, 'category') };
}

export function replyInput(body: unknown) {
  const data = dataInput(body, ['content']);
  return { content: text(data.content, 'content', 1, 10_000) };
}

export type ReplyInput = ReturnType<typeof replyInput>;
