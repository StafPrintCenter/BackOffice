export type InsertionMode = "link" | "image" | "video" | "emoji" | "table";

export type InsertionPayload =
  | { type: "link"; url: string; text: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string }
  | { type: "emoji"; value: string }
  | { type: "table"; rows: number; columns: number };
