#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/84514a773233becc1bb765e8c710a2bff9dfe4604116cbaf1592717f89024b02/contract';
import endContract from '../../snapshots/84514a773233becc1bb765e8c710a2bff9dfe4604116cbaf1592717f89024b02/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/900cbc6a6b80b87ca20b79c91d9732994159f1df878a07d114b8ee96b51bc7eb/contract';
import startContract from '../../snapshots/900cbc6a6b80b87ca20b79c91d9732994159f1df878a07d114b8ee96b51bc7eb/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
