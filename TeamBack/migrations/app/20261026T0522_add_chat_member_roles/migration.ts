#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/74680b649b452002b3f8f76585bdae4b14b39032d87213c2e2936b8bbf45fbf8/contract';
import endContract from '../../snapshots/74680b649b452002b3f8f76585bdae4b14b39032d87213c2e2936b8bbf45fbf8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fff014fa47d1aa8afc93619e3ccd099d8a2e5fa98ecf5109453f2ff866add260/contract';
import startContract from '../../snapshots/fff014fa47d1aa8afc93619e3ccd099d8a2e5fa98ecf5109453f2ff866add260/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'ChannelMember',
        column: col('role', 'text', {
          notNull: true,
          default: lit('MEMBER'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'ChannelMember',
        constraint: 'ChannelMember_role_check_bbc4be0d',
        expression: sql`"role" IN ('OWNER', 'MEMBER')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
