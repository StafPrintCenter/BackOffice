export type InsertionMode = "link" | "image" | "video" | "emoji" | "table";

export type InsertionPayload =
  | { type: "link"; url: string; text: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string }
  | { type: "emoji"; value: string }
  | { type: "table"; rows: number; columns: number };

export interface RichTextToolbarState {
  blockFormat: string;
  listType: "" | "ul" | "ol";
  listStyle: string;
  alignment: string;
  activeCommands: Record<string, boolean>;
  hasSelection: boolean;
  tableRows: number;
  tableColumns: number;
}

export type TableAction = "add-row" | "remove-row" | "add-column" | "remove-column";
