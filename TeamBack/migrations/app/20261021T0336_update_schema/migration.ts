#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/900cbc6a6b80b87ca20b79c91d9732994159f1df878a07d114b8ee96b51bc7eb/contract';
import endContract from '../../snapshots/900cbc6a6b80b87ca20b79c91d9732994159f1df878a07d114b8ee96b51bc7eb/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d8e950dd49fca3f5528630e0d38c27fa557a655a2eab2a8f770ea960f3c010d8/contract';
import startContract from '../../snapshots/d8e950dd49fca3f5528630e0d38c27fa557a655a2eab2a8f770ea960f3c010d8/contract.json' with { type: 'json' };
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

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      ...this.renameColumn({
        schema: 'public',
        table: 'User',
        column: 'ImageLink',
        to: 'imageUrl',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'TaskAssignee',
        constraint: 'TaskAssignee_taskId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'TaskAssignee',
        constraint: 'TaskAssignee_userId_fkey',
        kind: 'foreignKey',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'TaskAssignee',
        index: 'TaskAssignee_taskId_idx_4965c936',
      }),
      this.createTable({
        schema: 'public',
        table: 'TaskActivity',
        columns: [
          col('actorId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('metadata', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('taskId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'TaskActivity_type_check_2dfd60e8',
            sql`"type" IN ('WORKSPACE_CREATED', 'MEMBER_JOINED', 'MEMBER_REMOVED', 'INVITATION_SENT', 'INVITATION_DECLINED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_MOVED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_COMMENTED', 'TASK_DELETED')`,
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Task',
        column: col('tags', 'text[]', {
          notNull: true,
          default: lit([]),
          codecRef: { codecId: 'pg/text@1', many: true },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'WorkspaceInvitation',
        column: col('declinedAt', 'timestamptz(6)', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'WorkspaceInvitation',
        column: col('revokedAt', 'timestamptz(6)', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'WorkspaceInvitation',
        column: col('status', 'text', {
          notNull: true,
          default: lit('PENDING'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'TaskAssignee',
        column: 'workspaceId',
        type: 'uuid',
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'Workspace',
        column: 'slug',
        type: 'text',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Task',
        constraint: 'Task_tags_elem_not_null_aecbe9e2',
        expression: sql`array_position("tags", NULL) IS NULL`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'Task',
        constraint: 'Task_id_workspaceId_key',
        columns: ['id', 'workspaceId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Workspace',
        constraint: 'Workspace_slug_key',
        columns: ['slug'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'WorkspaceInvitation',
        constraint: 'WorkspaceInvitation_status_check_875de982',
        expression: sql`"status" IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED')`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskActivity',
        index: 'TaskActivity_actorId_idx_a58f6b4b',
        columns: ['actorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskActivity',
        index: 'TaskActivity_taskId_createdAt_idx_f41547ff',
        columns: ['taskId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskActivity',
        index: 'TaskActivity_taskId_idx_4965c936',
        columns: ['taskId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskActivity',
        index: 'TaskActivity_workspaceId_createdAt_idx_5ff7e893',
        columns: ['workspaceId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskActivity',
        index: 'TaskActivity_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskAssignee',
        index: 'TaskAssignee_taskId_workspaceId_idx_c5340bfa',
        columns: ['taskId', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TaskAssignee',
        index: 'TaskAssignee_workspaceId_userId_idx_6210ae03',
        columns: ['workspaceId', 'userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskActivity',
        foreignKey: {
          name: 'TaskActivity_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskActivity',
        foreignKey: {
          name: 'TaskActivity_taskId_fkey',
          columns: ['taskId'],
          references: { schema: 'public', table: 'Task', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskActivity',
        foreignKey: {
          name: 'TaskActivity_actorId_fkey',
          columns: ['actorId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskAssignee',
        foreignKey: {
          name: 'TaskAssignee_taskId_workspaceId_fkey',
          columns: ['taskId', 'workspaceId'],
          references: { schema: 'public', table: 'Task', columns: ['id', 'workspaceId'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskAssignee',
        foreignKey: {
          name: 'TaskAssignee_workspaceId_userId_fkey',
          columns: ['workspaceId', 'userId'],
          references: {
            schema: 'public',
            table: 'WorkspaceMember',
            columns: ['workspaceId', 'userId'],
          },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
