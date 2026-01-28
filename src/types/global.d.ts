/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Type declarations for drizzle-orm
declare module 'drizzle-orm/sqlite-core' {
  import { AnySQLiteColumn } from 'drizzle-orm';

  export function sqliteTable<T extends string>(
    name: T,
    columns: Record<string, AnySQLiteColumn>
  ): any;

  export function text(name: string): any;
  export function integer(name: string, options?: { primaryKey?: boolean; autoIncrement?: boolean }): any;
  export function real(name: string): any;
  export function boolean(name: string): any;
}

declare module 'drizzle-orm' {
  export function eq(column: any, value: any): any;
  export function ne(column: any, value: any): any;
  export function gt(column: any, value: any): any;
  export function gte(column: any, value: any): any;
  export function lt(column: any, value: any): any;
  export function lte(column: any, value: any): any;
  export function and(...conditions: any[]): any;
  export function or(...conditions: any[]): any;
  export function inArray(column: any, values: any[]): any;
  export function notInArray(column: any, values: any[]): any;
  export function like(column: any, pattern: string): any;
  export function ilike(column: any, pattern: string): any;
  export function between(column: any, left: any, right: any): any;
  export function isNull(column: any): any;
  export function isNotNull(column: any): any;
  export function desc(column: any): any;
  export function asc(column: any): any;
  export function sql<T>(strings: TemplateStringsArray, ...args: any[]): T;
  export { relations } from 'drizzle-orm/relations';
}

declare module 'drizzle-orm/relations' {
  export function relations(table: any, defineRelation: (relations: any) => any): any;
  export function many(table: any): any;
  export function one(table: any, config: { fields: any[]; references: any[] }): any;
}

// Type declarations for @kilocode/app-builder-db
declare module '@kilocode/app-builder-db' {
  import { Database } from 'better-sqlite3';

  export function createDatabase(schema: any): any;
  export function runMigrations(
    db: any,
    options: any,
    config: { migrationsFolder: string }
  ): Promise<void>;
}
