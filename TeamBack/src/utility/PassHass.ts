// package.json should include: "type": "module"
// Install: npm install argon2

import argon2 from "argon2";

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,   // Argon2id variant
      memoryCost: 2 ** 16,     // 64 MB
      timeCost: 3,             // Iterations
      parallelism: 1           // Threads
    });
    return hash;
  } catch (err) {
    throw new Error("Password hashing failed: " + (err as Error).message);
  }
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
  hash: string,
  plainPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (err) {
    throw new Error("Password verification failed: " + (err as Error).message);
  }
}


