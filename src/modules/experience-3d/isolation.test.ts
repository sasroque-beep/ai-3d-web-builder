import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Enforces the isolation and code-splitting decisions of Issues #26/#37 as a
 * test, since dependency-cruiser isn't set up yet (src/README.md): the
 * renderer (three, @react-three/*) may only be imported by scene files, and
 * nothing reachable through static imports from `Experience3DView` may be a
 * scene file — scenes are only ever reached via `dynamic(import())`, which
 * keeps them out of every route's First Load JS.
 */
const SRC = resolve(process.cwd(), "src");
const MODULE_DIR = join(SRC, "modules", "experience-3d");
const RENDERER_PACKAGE = /^(three|@react-three\/)/;
const STATIC_IMPORT = /^\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/gm;
const SOURCE_FILE = /\.(ts|tsx)$/;
const TEST_FILE = /\.test\.(ts|tsx)$/;

/** Files that ARE the renderer: scenes only. */
function isRendererFile(file: string): boolean {
  const path = relative(MODULE_DIR, file).split(sep).join("/");
  return (
    /^presets\/[^/]+\/[A-Za-z0-9]+Scene\.tsx$/.test(path) ||
    path === "SmokeTestScene.tsx"
  );
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name)
      ? [full]
      : [];
  });
}

function staticImports(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(STATIC_IMPORT)].map((match) => match[1] ?? "");
}

function resolveInternal(specifier: string, from: string): string | null {
  const base = specifier.startsWith("@/")
    ? join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(from, "..", specifier)
      : null;
  if (!base) return null;

  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function staticGraphFrom(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);

    for (const specifier of staticImports(file)) {
      const target = resolveInternal(specifier, file);
      if (target) queue.push(target);
    }
  }

  return seen;
}

describe("experience-3d isolation", () => {
  it("finds the scene files this guard is protecting (guards the guard)", () => {
    const renderers = listSourceFiles(MODULE_DIR).filter(isRendererFile);
    const names = renderers.map((file) =>
      relative(MODULE_DIR, file).split(sep).join("/"),
    );

    expect(names).toContain("presets/hero-showcase/HeroShowcaseScene.tsx");
    expect(names).toContain("SmokeTestScene.tsx");
  });

  it("only scene files inside the module import three or @react-three/*", () => {
    const offenders = listSourceFiles(MODULE_DIR)
      .filter((file) => !isRendererFile(file))
      .filter((file) =>
        staticImports(file).some((specifier) =>
          RENDERER_PACKAGE.test(specifier),
        ),
      )
      .map((file) => relative(SRC, file));

    expect(offenders).toEqual([]);
  });

  it("no file outside the module imports three or @react-three/*", () => {
    const offenders = listSourceFiles(SRC)
      .filter((file) => !file.startsWith(MODULE_DIR))
      .filter((file) =>
        staticImports(file).some((specifier) =>
          RENDERER_PACKAGE.test(specifier),
        ),
      )
      .map((file) => relative(SRC, file));

    expect(offenders).toEqual([]);
  });

  it("Experience3DView never reaches a scene through static imports", () => {
    const graph = staticGraphFrom(join(MODULE_DIR, "Experience3DView.tsx"));

    const rendererFiles = [...graph].filter(isRendererFile);
    const rendererImports = [...graph].filter((file) =>
      staticImports(file).some((specifier) => RENDERER_PACKAGE.test(specifier)),
    );

    expect(rendererFiles.map((file) => relative(SRC, file))).toEqual([]);
    expect(rendererImports.map((file) => relative(SRC, file))).toEqual([]);
    // sanity: the walk really followed the internal imports
    expect(graph.size).toBeGreaterThan(5);
  });

  it("the preset registry and validation are renderer-free (safe for server code)", () => {
    for (const entry of [
      "presets/registry.ts",
      "service.ts",
      "validation.ts",
    ]) {
      const graph = staticGraphFrom(join(MODULE_DIR, entry));
      const leaking = [...graph].filter(
        (file) =>
          isRendererFile(file) ||
          staticImports(file).some((specifier) =>
            RENDERER_PACKAGE.test(specifier),
          ),
      );

      expect(leaking.map((file) => relative(SRC, file))).toEqual([]);
    }
  });
});
