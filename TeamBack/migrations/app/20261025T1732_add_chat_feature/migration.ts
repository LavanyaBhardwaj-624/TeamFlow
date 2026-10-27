#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/84514a773233becc1bb765e8c710a2bff9dfe4604116cbaf1592717f89024b02/contract';
import startContract from '../../snapshots/84514a773233becc1bb765e8c710a2bff9dfe4604116cbaf1592717f89024b02/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/fff014fa47d1aa8afc93619e3ccd099d8a2e5fa98ecf5109453f2ff866add260/contract';
import endContract from '../../snapshots/fff014fa47d1aa8afc93619e3ccd099d8a2e5fa98ecf5109453f2ff866add260/contract.json' with { type: 'json' };
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
      this.createTable({
        schema: 'public',
        table: 'ChannelMember',
        columns: [
          col('channelId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('joinedAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('memberId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['channelId', 'memberId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ChatChannel',
        columns: [
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('createdBy', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('isDefault', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('PUBLIC'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('workspaceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('ChatChannel_type_check_1d386f6e', sql`"type" IN ('PUBLIC', 'PRIVATE')`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'JoinRequest',
        columns: [
          col('channelId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('responseAt', 'timestamptz(6)', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('responseBy', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('senderId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'JoinRequest_status_check_ec66e8d4',
            sql`"status" IN ('PENDING', 'APPROVED', 'DECLINED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Message',
        columns: [
          col('channelId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(6)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('deletedAt', 'timestamptz(6)', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('editedAt', 'timestamptz(6)', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 6 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('senderId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ChatChannel',
        constraint: 'ChatChannel_workspaceId_name_key',
        columns: ['workspaceId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ChatChannel',
        constraint: 'ChatChannel_id_workspaceId_key',
        columns: ['id', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ChannelMember',
        index: 'ChannelMember_channelId_idx_166d3598',
        columns: ['channelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ChannelMember',
        index: 'ChannelMember_memberId_idx_76b3c263',
        columns: ['memberId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ChannelMember',
        index: 'ChannelMember_workspaceId_memberId_idx_1f4f03c4',
        columns: ['workspaceId', 'memberId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ChatChannel',
        index: 'ChatChannel_createdBy_idx_ba0f792f',
        columns: ['createdBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ChatChannel',
        index: 'ChatChannel_workspaceId_createdAt_idx_5ff7e893',
        columns: ['workspaceId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ChatChannel',
        index: 'ChatChannel_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JoinRequest',
        index: 'JoinRequest_channelId_idx_166d3598',
        columns: ['channelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JoinRequest',
        index: 'JoinRequest_channelId_status_createdAt_idx_8ee7fb9a',
        columns: ['channelId', 'status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JoinRequest',
        index: 'JoinRequest_responseBy_idx_88dc1ef8',
        columns: ['responseBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JoinRequest',
        index: 'JoinRequest_senderId_createdAt_idx_ed252b01',
        columns: ['senderId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JoinRequest',
        index: 'JoinRequest_senderId_idx_4689c490',
        columns: ['senderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_channelId_createdAt_id_idx_bd37c14e',
        columns: ['channelId', 'createdAt', 'id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_channelId_idx_166d3598',
        columns: ['channelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_senderId_createdAt_idx_ed252b01',
        columns: ['senderId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_senderId_idx_4689c490',
        columns: ['senderId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ChannelMember',
        foreignKey: {
          name: 'ChannelMember_channelId_fkey',
          columns: ['channelId'],
          references: { schema: 'public', table: 'ChatChannel', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ChannelMember',
        foreignKey: {
          name: 'ChannelMember_workspaceId_memberId_fkey',
          columns: ['workspaceId', 'memberId'],
          references: {
            schema: 'public',
            table: 'WorkspaceMember',
            columns: ['workspaceId', 'userId'],
          },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ChatChannel',
        foreignKey: {
          name: 'ChatChannel_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ChatChannel',
        foreignKey: {
          name: 'ChatChannel_createdBy_fkey',
          columns: ['createdBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'JoinRequest',
        foreignKey: {
          name: 'JoinRequest_channelId_fkey',
          columns: ['channelId'],
          references: { schema: 'public', table: 'ChatChannel', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'JoinRequest',
        foreignKey: {
          name: 'JoinRequest_senderId_fkey',
          columns: ['senderId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'JoinRequest',
        foreignKey: {
          name: 'JoinRequest_responseBy_fkey',
          columns: ['responseBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Message',
        foreignKey: {
          name: 'Message_channelId_fkey',
          columns: ['channelId'],
          references: { schema: 'public', table: 'ChatChannel', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Message',
        foreignKey: {
          name: 'Message_senderId_fkey',
          columns: ['senderId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
