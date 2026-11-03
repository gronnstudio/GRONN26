// Dot-path access into the content document. Paths look like
// "siteCopy.heroSubtitle", "siteCopy.heroTitle.0" or
// "projects.slug:two-ponds-one-living-system.title" — the `slug:`
// segment resolves an array element by its slug, so components can
// address their own document without knowing array positions. Plain
// object/array traversal, no schema knowledge — kept dependency-free so
// the editor can later be extracted for other sites.
type Tree = Record<string, unknown> | unknown[]

function segments(path: string): (string | number)[] {
  return path.split(".").map((s) => (/^\d+$/.test(s) ? Number(s) : s))
}

function resolveIndex(node: unknown[], seg: string | number): number {
  if (typeof seg === "number") return seg
  if (seg.startsWith("slug:")) {
    const slug = seg.slice(5)
    return node.findIndex(
      (item) => (item as { slug?: string } | null)?.slug === slug
    )
  }
  return -1
}

export function getAtPath(tree: unknown, path: string): unknown {
  let node: unknown = tree
  for (const seg of segments(path)) {
    if (node == null || typeof node !== "object") return undefined
    if (Array.isArray(node)) {
      const index = resolveIndex(node, seg)
      if (index < 0) return undefined
      node = node[index]
    } else {
      node = (node as Record<string, unknown>)[seg as string]
    }
  }
  return node
}

/** Immutable set: returns a new tree with `value` placed at `path`. */
export function setAtPath<T extends Tree>(tree: T, path: string, value: unknown): T {
  const segs = segments(path)
  const clone = (node: unknown, depth: number): unknown => {
    if (depth === segs.length) return value
    const seg = segs[depth]
    if (Array.isArray(node)) {
      const index = resolveIndex(node, seg)
      if (index < 0) return node
      const next = node.slice()
      next[index] = clone(node[index], depth + 1)
      return next
    }
    const obj = { ...(node as Record<string, unknown>) }
    obj[seg as string] = clone(obj[seg as string], depth + 1)
    return obj
  }
  return clone(tree, 0) as T
}
