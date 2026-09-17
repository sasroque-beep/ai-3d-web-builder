import type { DeviceSignal } from "./types";

const LOW_CORE_COUNT_THRESHOLD = 2;
const SLOW_EFFECTIVE_TYPES = new Set(["slow-2g", "2g"]);

/**
 * Network Information API — experimental, not in lib.dom.d.ts, and only
 * ever read defensively (every field is optional/possibly absent).
 */
interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Only ever returns "low" on a technically reliable signal (a low core
 * count, or an explicit save-data/slow-connection hint); every other case
 * — including every one of these APIs being unavailable, which is common
 * (Safari/Firefox don't expose `deviceMemory`/`connection`) — is
 * "unknown", never treated as confirmation of capable hardware.
 */
export function detectDeviceTier(): DeviceSignal {
  if (typeof navigator === "undefined") return "unknown";

  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores <= LOW_CORE_COUNT_THRESHOLD) {
    return "low";
  }

  const connection = (
    navigator as Navigator & { connection?: NetworkInformationLike }
  ).connection;
  if (connection?.saveData === true) return "low";
  if (
    typeof connection?.effectiveType === "string" &&
    SLOW_EFFECTIVE_TYPES.has(connection.effectiveType)
  ) {
    return "low";
  }

  return "unknown";
}
