export type PlayerColorID =
  | "ice"
  | "aurora"
  | "frost"
  | "midnight"
  | "scarlet"
  | "emerald"
  | "solar"
  | "amethyst"
  | "coral"
  | "teal"
  | "obsidian"
  | "pearl";

export const playerColorOptions: Array<{ id: PlayerColorID; label: string; value: string }> = [
  { id: "ice", label: "Ice", value: "#63ece3" },
  { id: "aurora", label: "Aurora", value: "#78e9ff" },
  { id: "frost", label: "Frost", value: "#a8c9ff" },
  { id: "midnight", label: "Midnight", value: "#8ea6ff" },
  { id: "scarlet", label: "Scarlet", value: "#ff3b30" },
  { id: "emerald", label: "Emerald", value: "#2ecc71" },
  { id: "solar", label: "Solar", value: "#ffd700" },
  { id: "amethyst", label: "Amethyst", value: "#9b59b6" },
  { id: "coral", label: "Coral", value: "#ff7f6a" },
  { id: "teal", label: "Teal", value: "#00b3a4" },
  { id: "obsidian", label: "Obsidian", value: "#39445a" },
  { id: "pearl", label: "Pearl", value: "#e7f4ff" }
];

export const defaultPlayerColorID: PlayerColorID = "ice";

export const playerColorCycle: PlayerColorID[] = [
  "ice",
  "aurora",
  "frost",
  "midnight",
  "scarlet",
  "emerald",
  "solar",
  "amethyst",
  "coral",
  "teal",
  "obsidian",
  "pearl"
];

export function resolvePlayerColorValue(id: string): string {
  return playerColorOptions.find((item) => item.id === id)?.value ?? "#63ece3";
}

export function isValidPlayerColorID(id: unknown): id is PlayerColorID {
  return typeof id === "string" && playerColorOptions.some((item) => item.id === id);
}
