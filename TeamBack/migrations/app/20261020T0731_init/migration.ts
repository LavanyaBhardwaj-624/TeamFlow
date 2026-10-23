#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d8e950dd49fca3f5528630e0d38c27fa557a655a2eab2a8f770ea960f3c010d8/contract';
import endContract from '../../snapshots/d8e950dd49fca3f5528630e0d38c27fa557a655a2eab2a8f770ea960f3c010d8/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Task',
        columns: [
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('createdBy', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('dueAt', 'timestamptz(6)', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('priority', 'text', {
            notNull: true,
            default: lit('MEDIUM'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('TODO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Task_priority_check_8918b779',
            sql`"priority" IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')`,
          ),
          checkExpression(
            'Task_status_check_217ccf21',
            sql`"status" IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'TaskAssignee',
        columns: [
          col('assignedAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('taskId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['taskId', 'userId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TaskComment',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('taskId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('ImageLink', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Workspace',
        columns: [
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('createdBy', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'WorkspaceInvitation',
        columns: [
          col('acceptedAt', 'timestamptz(6)', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expiresAt', 'timestamptz(6)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('invitedBy', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WorkspaceInvitation_role_check_ddb31015',
            sql`"role" IN ('ADMIN', 'MEMBER')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'WorkspaceMember',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('joinedAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('role', 'text', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WorkspaceMember_role_check_ddb31015',
            sql`"role" IN ('ADMIN', 'MEMBER')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WorkspaceInvitation',
        constraint: 'WorkspaceInvitation_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WorkspaceMember',
        constraint: 'WorkspaceMember_workspaceId_userId_key',
        columns: ['workspaceId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Task',
        index: 'Task_createdBy_idx_ba0f792f',
        columns: ['createdBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Task',
        index: 'Task_dueAt_idx_08d8815e',
        columns: ['dueAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Task',
        index: 'Task_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Task',
        index: 'Task_workspaceId_status_idx_76d68132',
        columns: ['workspaceId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskAssignee',
        index: 'TaskAssignee_taskId_idx_4965c936',
        columns: ['taskId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskAssignee',
        index: 'TaskAssignee_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskComment',
        index: 'TaskComment_taskId_createdAt_idx_f41547ff',
        columns: ['taskId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskComment',
        index: 'TaskComment_taskId_idx_4965c936',
        columns: ['taskId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskComment',
        index: 'TaskComment_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Workspace',
        index: 'Workspace_createdBy_idx_ba0f792f',
        columns: ['createdBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceInvitation',
        index: 'WorkspaceInvitation_invitedBy_idx_8266eaa5',
        columns: ['invitedBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceInvitation',
        index: 'WorkspaceInvitation_workspaceId_email_idx_7f289aec',
        columns: ['workspaceId', 'email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceInvitation',
        index: 'WorkspaceInvitation_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Task',
        foreignKey: {
          name: 'Task_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Task',
        foreignKey: {
          name: 'Task_createdBy_fkey',
          columns: ['createdBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskAssignee',
        foreignKey: {
          name: 'TaskAssignee_taskId_fkey',
          columns: ['taskId'],
          references: { schema: 'public', table: 'Task', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskAssignee',
        foreignKey: {
          name: 'TaskAssignee_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskComment',
        foreignKey: {
          name: 'TaskComment_taskId_fkey',
          columns: ['taskId'],
          references: { schema: 'public', table: 'Task', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskComment',
        foreignKey: {
          name: 'TaskComment_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Workspace',
        foreignKey: {
          name: 'Workspace_createdBy_fkey',
          columns: ['createdBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceInvitation',
        foreignKey: {
          name: 'WorkspaceInvitation_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceInvitation',
        foreignKey: {
          name: 'WorkspaceInvitation_invitedBy_fkey',
          columns: ['invitedBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceMember',
        foreignKey: {
          name: 'WorkspaceMember_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceMember',
        foreignKey: {
          name: 'WorkspaceMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
