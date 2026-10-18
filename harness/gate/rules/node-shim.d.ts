// The harness type-check (tsconfig.harness.json) runs with "types": [] and no
// @types/node, so declare only the node APIs the applied rule uses.
declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: 'utf8'): string;
}
declare module 'node:path' {
  export function basename(path: string): string;
  export function dirname(path: string): string;
}
