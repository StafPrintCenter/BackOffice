export { };
declare global {
  interface Window {
    SPCIntelligence?: {
      open: (prompt?: string) => void;
      close: () => void;
      setContext: (fn: () => { title: string; text: string }) => void;
    };
  }
}
