/**
 * MurmurHash3 (32-bit) — Industry standard non-cryptographic hash.
 * Fast, excellent distribution, used in HBase, Cassandra, Elasticsearch.
 *
 * @param key  — The input string to hash
 * @param seed — Seed for generating different hash families
 * @returns Unsigned 32-bit integer hash
 */
export function murmurhash3(key: string, seed = 0): number {
  const bytes = Buffer.from(key, 'utf8');
  const len = bytes.length;

  let h1 = seed >>> 0;

  const C1 = 0xcc9e2d51;
  const C2 = 0x1b873593;

  // Body — process 4-byte chunks
  const nblocks = Math.floor(len / 4);
  for (let i = 0; i < nblocks; i++) {
    let k1 = bytes.readUInt32LE(i * 4);

    k1 = Math.imul(k1, C1) >>> 0;
    k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0; // rotl32(k1, 15)
    k1 = Math.imul(k1, C2) >>> 0;

    h1 ^= k1;
    h1 = ((h1 << 13) | (h1 >>> 19)) >>> 0; // rotl32(h1, 13)
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }

  // Tail — handle remaining bytes
  let k1 = 0;
  const tail = nblocks * 4;
  switch (len & 3) {
    case 3:
      k1 ^= bytes[tail + 2] << 16; // fallthrough
    case 2:
      k1 ^= bytes[tail + 1] << 8; // fallthrough
    case 1:
      k1 ^= bytes[tail];
      k1 = Math.imul(k1, C1) >>> 0;
      k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
      k1 = Math.imul(k1, C2) >>> 0;
      h1 ^= k1;
  }

  // Finalization mix — force all bits to avalanche
  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b) >>> 0;
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35) >>> 0;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

/**
 * Double Hashing Strategy (Kirsch-Mitzenmacher optimization).
 *
 * Instead of k independent hash functions, we use:
 *   g_i(x) = h1(x) + i * h2(x) mod m
 *
 * This reduces hash computation from O(k) to O(1) with no accuracy loss.
 * Paper: "Less Hashing, Same Performance" — Kirsch & Mitzenmacher, 2006
 *
 * @param key — Element to hash
 * @param k   — Number of hash positions needed
 * @param m   — Bit array size (modulus)
 * @returns Array of k bit positions
 */
export function getHashPositions(key: string, k: number, m: number): number[] {
  const h1 = murmurhash3(key, 0x9747b28c);
  const h2 = murmurhash3(key, 0x5f3759df);

  const positions = new Array<number>(k);
  
  for (let i = 0; i < k; i++) {
    positions[i] = Number(
      (BigInt(h1) + BigInt(i) * BigInt(h2)) % BigInt(m) // x & (m - 1)
    );
  }
  return positions;
}
