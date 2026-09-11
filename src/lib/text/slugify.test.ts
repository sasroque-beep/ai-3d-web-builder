import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hero Section")).toBe("hero-section");
  });

  it("strips accents/diacritics", () => {
    expect(slugify("Conversão Máxima")).toBe("conversao-maxima");
  });

  it("collapses runs of separators into a single hyphen", () => {
    expect(slugify("a  --  b__c")).toBe("a-b-c");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  !Landing Page!  ")).toBe("landing-page");
  });

  it("returns an empty string when there is nothing slug-worthy", () => {
    expect(slugify("!!!")).toBe("");
  });
});
