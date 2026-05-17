/**
 * Simulate network latency for mock data flows.
 * Resolves with the given value after a delay (uniform in the provided range).
 */
export function simulateDelay<T>(value: T, minMs = 300, maxMs = 700): Promise<T> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}
