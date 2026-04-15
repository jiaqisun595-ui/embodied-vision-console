// Mock log lines shaped like the real NDJSON stream input.

export type ThoughtRole = "brain" | "world" | "act" | "done";

export interface ThoughtItem {
  role: ThoughtRole;
  label: string;
  content: string;
  code?: string;
}

export const MOCK_THOUGHT_LINES: string[] = [
  '{"ts":"14:03:11","level":"INFO","module":"asr","message":"command received"}',
  '{"ts":"14:03:11","level":"INFO","module":"asr","text":"walk to waypoint alpha"}',
  '{"ts":"14:03:12","level":"INFO","module":"planner","message":"task parsing started"}',
  '{"ts":"14:03:12","level":"INFO","module":"planner","message":"navigation target resolved","target":"alpha"}',
  '{"ts":"14:03:13","level":"INFO","module":"world","message":"scene update received"}',
  '{"ts":"14:03:13","level":"INFO","module":"world","message":"obstacle map refreshed"}',
  '{"ts":"14:03:14","level":"INFO","module":"nav","message":"path planning started"}',
  '{"ts":"14:03:14","level":"INFO","module":"nav","message":"path planning success","distance_m":4.7}',
  '{"ts":"14:03:15","level":"INFO","module":"nav","message":"walking"}',
  '{"ts":"14:03:16","level":"INFO","module":"nav","message":"progress update","progress":"1.2 / 4.7 m"}',
  '{"ts":"14:03:18","level":"INFO","module":"nav","message":"progress update","progress":"3.8 / 4.7 m"}',
  '{"ts":"14:03:20","level":"INFO","module":"nav","message":"target reached","target":"alpha"}',
  '{"ts":"14:03:20","level":"INFO","module":"brain","message":"awaiting next command"}',
];
