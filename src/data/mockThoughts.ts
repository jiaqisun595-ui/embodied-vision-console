// Mock data for the left-column ThoughtStream.
// Swap this file's export for the real API response shape when the brain
// module endpoint is ready. The ThoughtStream component only depends on the
// ThoughtItem type from @/types/thought.

import type { ThoughtItem } from "@/types/thought";
export type { ThoughtItem };
export type { ThoughtRole } from "@/types/thought";

export const MOCK_THOUGHTS: ThoughtItem[] = [
  {
    role: "brain",
    label: "parse_cmd",
    content:
      'Heard: "walk to the farthest chair, then return to the table behind the start point"',
  },
  {
    role: "brain",
    label: "plan",
    content:
      "Decomposing into 2 sub-goals: (1) locate farthest chair, (2) locate start-relative table.",
  },
  {
    role: "world",
    label: "scan_scene",
    content: "Scanning RGB + depth... detected 4 chairs, 2 tables, 1 sofa.",
  },
  {
    role: "world",
    label: "rank_targets",
    content: "Computing distance to each chair from current pose.",
    code: 'chairs = [{"id":"c1","d":1.8},{"id":"c2","d":3.2},{"id":"c3","d":4.7},{"id":"c4","d":2.4}]',
  },
  {
    role: "brain",
    label: "select",
    content: "Target A = chair c3 (distance 4.7 m, farthest).",
  },
  {
    role: "act",
    label: "nav_to",
    content: "Dispatching navigation goal → chair c3.",
    code: "POST /nav_aim  { target: 'c3', mode: 'walk' }",
  },
  {
    role: "world",
    label: "progress",
    content: "Walking... 1.2 m / 4.7 m · obstacle-free corridor.",
  },
  {
    role: "world",
    label: "progress",
    content: "Walking... 3.8 m / 4.7 m · approaching target.",
  },
  {
    role: "done",
    label: "subgoal_1",
    content: "Arrived at chair c3. Sub-goal 1 complete.",
  },
  {
    role: "brain",
    label: "recall",
    content:
      'Resolving "the table behind the start point" via spatial memory of start pose.',
  },
  {
    role: "world",
    label: "lookup_memory",
    content: "Start pose = (0.00, 0.00). Table t1 at (-0.40, -1.10) · behind.",
  },
  {
    role: "brain",
    label: "select",
    content: "Target B = table t1.",
  },
  {
    role: "act",
    label: "nav_to",
    content: "Dispatching navigation goal → table t1.",
    code: "POST /nav_aim  { target: 't1', mode: 'walk' }",
  },
  {
    role: "world",
    label: "progress",
    content: "Turning 168°... re-planning path around sofa.",
  },
  {
    role: "world",
    label: "progress",
    content: "Walking... 2.1 m / 5.9 m.",
  },
  {
    role: "world",
    label: "progress",
    content: "Walking... 5.4 m / 5.9 m · final approach.",
  },
  {
    role: "done",
    label: "subgoal_2",
    content: "Arrived at table t1. All sub-goals complete.",
  },
  {
    role: "brain",
    label: "idle",
    content: "Awaiting next command.",
  },
];
