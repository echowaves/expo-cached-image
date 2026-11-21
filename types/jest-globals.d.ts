// Minimal ambient types for the jest globals used by this suite, so test files can be
// linted with type information without adding a devDependency. Ignored by ts-standard
// (`**/*.d.ts`), and excluded from the published build by tsconfig.json.

declare namespace jest {
  function mock (moduleName: string, factory: () => unknown): void
}

interface JestMatchers {
  toBe: (expected: unknown) => void
  toEqual: (expected: unknown) => void
  toContain: (expected: unknown) => void
  toHaveLength: (expected: number) => void
  toThrow: (expected?: string | RegExp) => void
  toBeGreaterThanOrEqual: (expected: number) => void
  toBeLessThan: (expected: number) => void
}

interface JestAsyncMatchers {
  toBe: (expected: unknown) => Promise<void>
  toEqual: (expected: unknown) => Promise<void>
  toContain: (expected: unknown) => Promise<void>
  toHaveLength: (expected: number) => Promise<void>
  toThrow: (expected?: string | RegExp) => Promise<void>
}

type JestExpect = (actual: unknown) => JestMatchers & {
  resolves: JestAsyncMatchers
  rejects: JestAsyncMatchers
}

declare const expect: JestExpect
declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => void | Promise<void>) => void
declare const beforeEach: (fn: () => void) => void
