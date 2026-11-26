import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

/**
 * Supported string encodings for generated random tokens
 */
export type TokenEncoding = 'hex' | 'base64' | 'base64url';

/**
 * Configuration options for generating cryptographically random tokens
 */
export interface GenerateTokenOptions {
  /** Number of random bytes to generate before encoding (defaults to `32`) */
  length?: number;
  /** Output string encoding format (defaults to `'hex'`) */
  encoding?: TokenEncoding;
}

/**
 * Provides password hashing and verification, SHA-256 digesting,
 * bcrypt format checks, and cryptographically secure random token generation
 */
@Injectable()
export class HashService {
  private readonly defaultSaltRounds = 10;
  private readonly defaultTokenLength = 32;

  /**
   * Hashes a plain-text value (such as a password) using bcrypt
   *
   * Generates a salt using the configured default cost factor (`defaultSaltRounds`)
   * and returns the resulting bcrypt hash string
   *
   * @param value - Plain-text string to hash
   * @returns A promise resolving to the generated bcrypt hash
   */
  public async hashBcripto(value: string): Promise<string> {
    return bcrypt.hash(value, this.defaultSaltRounds);
  }

  /**
   * Compares a plain-text password against a stored bcrypt hash
   *
   * @param password - Plain-text password candidate to verify
   * @param hash - Stored bcrypt hash to compare against
   * @returns A promise resolving to `true` if the password matches the hash, or `false` otherwise
   */
  public async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Computes a SHA-256 hash digest encoded as a hexadecimal string
   *
   * Suitable for fast deterministic hashing (such as token lookup keys),
   * not for storing user passwords
   *
   * @param data - Input string to digest with SHA-256
   * @returns Lowercase hexadecimal SHA-256 digest string
   */
  public hashSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Checks whether a string matches the standard bcrypt hash format
   *
   * Validates the `$2a$`, `$2b$`, or `$2y$` prefix, two-digit cost factor,
   * and 53-character base64-encoded salt and hash payload
   *
   * @param value - String to test against the bcrypt format pattern
   * @returns `true` if the string matches a standard bcrypt hash structure, or `false` otherwise
   */
  public isBcryptHash(value: string): boolean {
    const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(value);
  }
/**
   * Generates a cryptographically secure random token string
   *
   * Uses `crypto.randomBytes` to generate random bytes and encodes them
   * using the requested encoding format
   *
   * @param options - Optional token generation settings (`length` in bytes and `encoding`)
   * @returns Encoded random token string
   */
  public generateRandomToken(options?: GenerateTokenOptions): string {
    const length = options?.length ?? this.defaultTokenLength;
    const encoding = options?.encoding ?? 'hex';

    return crypto.randomBytes(length).toString(encoding);
  }
}
