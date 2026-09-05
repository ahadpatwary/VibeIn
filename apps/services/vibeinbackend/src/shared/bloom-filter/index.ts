import type { Redis } from 'ioredis';
import { BloomFilter, BloomFilterOptions } from './bloom-filter/bloom-filter';

/**
 * Redis Bloom Filter — Industry Standard Implementation
 *
 * Exports:
 *   BloomFilter  — Standard + Counting Bloom Filter
 *   createBloomFilter — Factory helper (init included)
 */

export async function createBloomFilter(
  redis: Redis,
  options: BloomFilterOptions = {},
): Promise<BloomFilter> {
  const bf = new BloomFilter(redis, options);
  await bf.init();
  return bf;
}

export { BloomFilter };
export type { BloomFilterOptions };
