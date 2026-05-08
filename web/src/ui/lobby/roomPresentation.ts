const roomNames = [
  "Frozen Dock",
  "Orca Table",
  "Penguin Vault",
  "Krill Alley",
  "North Pier",
  "Iceberg Casino",
  "Midnight Hielo",
  "Seal Cove",
  "Arctic Base",
  "Blizzard Peak",
];

export function deriveRoomName(matchID: string): string {
  let hash = 0;
  for (let i = 0; i < matchID.length; i++) {
    hash = (hash << 5) - hash + matchID.charCodeAt(i);
    hash |= 0;
  }
  return roomNames[Math.abs(hash) % roomNames.length] ?? "New Expedition Table";
}
