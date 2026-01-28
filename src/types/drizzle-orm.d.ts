declare module 'drizzle-orm' {
  export {
    sqliteTable,
    text,
    integer,
    serial,
    primaryKey,
    boolean,
    timestamp,
    real,
  } from 'drizzle-orm/sqlite-core';
  
  export { eq, ne, gt, gte, lt, lte, and, or, inArray, notInArray, like, ilike, between, isNull, isNotNull } from 'drizzle-orm';
  export { desc, asc, sql } from 'drizzle-orm';
  export { relations } from 'drizzle-orm/relations';
  export { createDatabase, runMigrations } from '@kilocode/app-builder-db';
}

declare module 'drizzle-orm/sqlite-core' {
  export function sqliteTable(name: string, columns: any): any;
  export function text(name: string): any;
  export function integer(name: string, options?: any): any;
  export function serial(name: string): any;
  export function primaryKey(name: string): any;
  export function boolean(name: string): any;
  export function timestamp(name: string, options?: any): any;
  export function real(name: string): any;
}

declare module 'drizzle-orm/relations' {
  export function relations(table: any, defineRelation: any): any;
  export function many(table: any): any;
  export function one(table: any, foreignKey: any, references: any): any;
}
