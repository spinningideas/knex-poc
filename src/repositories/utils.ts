import { Knex } from "knex";

export const HEARTBEAT_QUERIES = Object.freeze({
  ORACLE: "select 1 from DUAL",
  POSTGRESQL: "SELECT 1",
  MYSQL: "SELECT 1",
  MSSQL: "SELECT 1",
  SQLITE: "SELECT 1",
  DEFAULT: "SELECT 1",
});

export interface HeartbeatResult {
  isOk: boolean;
  error?: Error;
}

/**
 *
 * @param {Object} knex - Knex instance
 * @param {string} heartbeatQuery - SQL query that will be executed to check if connection is valid
 * @returns Promise<{Object|undefined}> wrapped error if connection is not valid, wrapped 'isOk: true' if it is valid, undefined if connection does not yet exist
 */
export function checkHeartbeat(
  knex: Knex,
  heartbeatQuery = HEARTBEAT_QUERIES.DEFAULT
): Promise<HeartbeatResult> {
  if (!knex) {
    throw new Error("Knex is a mandatory parameter");
  }

  return knex
    .raw(heartbeatQuery)
    .then(() => {
      return {
        isOk: true,
      };
    })
    .catch((err: Error) => {
      return {
        isOk: false,
        error: err,
      };
    });
}

function arrayIncludesWith(array: any[], target: any, comparator: any) {
  if (array == null) {
    return false;
  }

  for (const value of array) {
    if (comparator(target, value)) {
      return true;
    }
  }
  return false;
}

function baseDifference<T>(
  initialArray: T[],
  newArray: T[],
  comparator: any
): EntityListDiff<T> {
  const includes = arrayIncludesWith;
  const newEntries: T[] = [];
  const removedEntries: T[] = [];

  for (const value of initialArray) {
    if (!includes(newArray, value, comparator)) {
      removedEntries.push(value);
    }
  }

  for (const value of newArray) {
    if (!includes(initialArray, value, comparator)) {
      newEntries.push(value);
    }
  }

  return {
    removedEntries,
    newEntries,
  };
}

export type EntityListDiff<T> = {
  newEntries: T[];
  removedEntries: T[];
};

export function calculateEntityListDiff<T>(
  oldList: T[],
  newList: T[],
  idFields: string[]
): EntityListDiff<T> {
  const comparator = (value1: any, value2: any) => {
    for (const idField of idFields) {
      if (value1[idField] !== value2[idField]) {
        return false;
      }
    }
    return true;
  };

  return baseDifference(oldList, newList, comparator);
}

export type UpdateJoinTableParams = {
  filterCriteria: Record<string, any>;
  table: string;
  primaryKeyField?: string;
  chunkSize?: number;
  idFields: string[];
  transactionProvider?: Knex.TransactionProvider;
  transaction?: Knex.Transaction;
};

async function getKnexOrTrx(
  knex: Knex,
  params: UpdateJoinTableParams
): Promise<Knex | Knex.Transaction> {
  if (knex.client.driverName === "sqlite3") {
    return knex;
  }

  if (params.transaction) {
    return params.transaction;
  }

  if (params.transactionProvider) {
    return params.transactionProvider();
  }

  return knex.transaction();
}

export async function updateJoinTable<T>(
  knex: Knex,
  newList: T[],
  params: UpdateJoinTableParams
): Promise<EntityListDiff<T>> {
  const chunkSize = params.chunkSize || 100;
  const trx = await getKnexOrTrx(knex, params);
  try {
    const oldList = await trx(params.table)
      .select("*")
      .where(params.filterCriteria);
    const diff = calculateEntityListDiff(oldList, newList, params.idFields);

    const insertChunks = chunk(diff.newEntries, chunkSize);
    for (const insertChunk of insertChunks) {
      await trx(params.table).insert(insertChunk);
    }

    // If we have a primary key, then we can delete in batch
    if (params.primaryKeyField) {
      const deleteIds = diff.removedEntries.map((entry) => {
        return entry[params.primaryKeyField!];
      });
      const deleteChunks = chunk(deleteIds, chunkSize);
      for (const deleteChunk of deleteChunks) {
        await trx(params.table)
          .delete()
          .whereIn(params.primaryKeyField, deleteChunk);
      }
    }
    // Otherwise we have to delete one-by-one
    else {
      const deleteCriteria = diff.removedEntries.map((entry) => {
        return pick(entry, params.idFields);
      });
      for (const entry of deleteCriteria) {
        await trx(params.table).delete().where(entry);
      }
    }

    if (
      trx.isTransaction &&
      !params.transaction &&
      !params.transactionProvider
    ) {
      await (trx as Knex.Transaction).commit();
    }
    return diff;
  } catch (err) {
    if (trx.isTransaction) {
      await (trx as Knex.Transaction).rollback();
    }
    throw err;
  }
}

function slice<T>(array: T[], start: number, end: number): T[] {
  let length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  start = start == null ? 0 : start;
  end = end === undefined ? length : end;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : (end - start) >>> 0;
  start >>>= 0;

  let index = -1;
  const result = new Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

export function chunk<T>(array: T[], size: number): T[] {
  const length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  let index = 0;
  let resIndex = 0;
  const result = new Array(Math.ceil(length / size));

  while (index < length) {
    result[resIndex++] = slice(array, index, (index += size));
  }
  return result;
}

export function copyWithoutUndefined<
  T extends Record<K, V>,
  K extends string | number | symbol,
  V
>(originalValue: T): T {
  return Object.keys(originalValue).reduce((acc, key) => {
    // @ts-ignore
    if (originalValue[key] !== undefined) {
      // @ts-ignore
      acc[key] = originalValue[key];
    }
    return acc;
  }, {} as Record<string, any>) as T;
}

export function pick<T extends object, K extends string | number | symbol>(
  source: T,
  propNames: readonly K[]
): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>> {
  const result = {} as T;
  let idx = 0;
  while (idx < propNames.length) {
    if (propNames[idx] in source) {
      // @ts-ignore
      result[propNames[idx]] = source[propNames[idx]];
    }
    idx += 1;
  }
  return result;
}

export function pickWithoutUndefined<T, K extends string | number | symbol>(
  source: T,
  propNames: readonly K[]
): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>> {
  const result = {} as T;
  let idx = 0;
  while (idx < propNames.length) {
    // @ts-ignore
    if (propNames[idx] in source && source[propNames[idx]] !== undefined) {
      // @ts-ignore
      result[propNames[idx]] = source[propNames[idx]];
    }
    idx += 1;
  }
  return result;
}

export function validateOnlyWhitelistedFields<T>(
  source: T,
  propNames: readonly string[]
) {
  const keys = Object.keys(source);
  for (var x = 0; x < keys.length; x++) {
    if (propNames.indexOf(keys[x]) === -1) {
      throw new Error(`Unsupported field: ${keys[x]}`);
    }
  }
}

export function validateOnlyWhitelistedFieldsSet(
  source: Record<string, any>,
  propNames: Set<string>
) {
  const keys = Object.keys(source);
  for (var x = 0; x < keys.length; x++) {
    if (!propNames.has(keys[x])) {
      throw new Error(`Unsupported field: ${keys[x]}`);
    }
  }
}

export function strictPickWithoutUndefined<T>(
  source: T,
  propNames: readonly string[]
): Pick<T, Exclude<keyof T, Exclude<keyof T, string>>> {
  validateOnlyWhitelistedFields(source, propNames);
  return pickWithoutUndefined(source, propNames);
}

export function isEmptyObject(params: Record<string, any>): boolean {
  for (const key in params) {
    if (params.hasOwnProperty(key) && params[key] !== undefined) {
      return false;
    }
  }
  return true;
}

export function groupBy<T>(
  inputArray: T[],
  propName: string
): Record<string, T[]> {
  return inputArray.reduce((result, entry) => {
    // @ts-ignore
    const key = entry[propName];

    // @ts-ignore
    if (Object.hasOwnProperty.call(result, key)) {
      // @ts-ignore
      result[key].push(entry);
    } else {
      // @ts-ignore
      result[key] = [entry];
    }
    return result;
  }, {});
}
