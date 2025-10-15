export {};

declare global {
  // Ambient declaration to satisfy TypeScript when non-edge code references Deno
  // This does not provide a runtime polyfill; it only fixes type errors.
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}
