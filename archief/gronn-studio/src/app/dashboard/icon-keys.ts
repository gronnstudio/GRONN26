// The icons a surface may name, in a module with no React in it.
//
// Two reasons it lives apart from the shell that renders them. The shell
// is a Client Component, so a test importing it would drag React and
// lucide into a Node process for the sake of one array. And the array is
// the contract: a navigation is built on the server and handed across
// the boundary as data, so the only thing a surface may carry is one of
// these strings. That rule cost a production outage when it was a
// component instead — see tests/e2e/panel-boundary.spec.ts.
export const ICON_KEYS = [
  "dashboard",
  "agenda",
  "intakes",
  "documents",
  "analytics",
  "clients",
  "hours",
  "drain",
  "editor",
  "legal",
  // The documents shelf, on the phone strip right beside the builder —
  // two identical page icons side by side read as one thing twice.
  "shelf",
] as const

export type IconKey = (typeof ICON_KEYS)[number]
