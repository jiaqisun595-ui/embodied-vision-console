export type ThoughtRole = "brain" | "world" | "act" | "done";

export interface ThoughtItem {
  role: ThoughtRole;
  label: string; // short tag, e.g. "parse_cmd"
  content: string; // main text shown on the card
  code?: string; // optional monospace code/JSON block
}
