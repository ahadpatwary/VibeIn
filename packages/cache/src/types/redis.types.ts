export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    tls?: boolean;
    connectTimeout?: number;
    commandTimeout?: number;
    maxRetriesPerRequest?: number;
    retryStrategy?: (times: number) => number | null;
    enableReadyCheck?: boolean;
    lazyConnect?: boolean;
    keepAlive?: number;
    family?: 4 | 6;
    sentinels?: Array<{ host: string; port: number }>;
    name?: string; // Sentinel master name
    clusterMode?: boolean;
    clusterNodes?: Array<{ host: string; port: number }>;
}

export interface CacheOptions {
    ttl?: number; // seconds
    nx?: boolean; // only set if not exists
    xx?: boolean; // only set if exists
    keepTTL?: boolean;
}

export interface SetOptions {
    ex?: number; // expire in seconds
    px?: number; // expire in milliseconds
    exat?: number; // expire at unix timestamp (seconds)
    pxat?: number; // expire at unix timestamp (ms)
    nx?: boolean;
    xx?: boolean;
    keepttl?: boolean;
    get?: boolean;
}

export interface ScanOptions {
    match?: string;
    count?: number;
    type?: string;
}

export interface ZRangeOptions {
    rev?: boolean;
    limit?: { offset: number; count: number };
    withScores?: boolean;
    byScore?: boolean;
    byLex?: boolean;
}

export interface ZMember {
    score: number;
    member: string;
}

export interface HashScanResult {
    cursor: string;
    data: Record<string, string>;
}

export interface ScanResult {
    cursor: string;
    keys: string[];
}

export interface RedisPipelineResult {
    results: Array<[Error | null, unknown]>;
    errors: Error[];
}

export interface RedisInfo {
    server: Record<string, string>;
    clients: Record<string, string>;
    memory: Record<string, string>;
    stats: Record<string, string>;
    replication: Record<string, string>;
    cpu: Record<string, string>;
    keyspace: Record<string, string>;
}

export interface LockOptions {
    ttl: number; // seconds
    retryCount?: number;
    retryDelay?: number; // ms
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    total: number;
}

export type RedisValue = string | number | Buffer;
export type Nullable<T> = T | null;
export type MaybeArray<T> = T | T[];
