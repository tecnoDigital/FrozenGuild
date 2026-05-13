import { useMemo, useState, useCallback } from "react";
import styles from "../lobby/LobbyGlass.module.css";
import { LobbyShell } from "../lobby/LobbyShell.js";
import { LobbyLeftColumn } from "../lobby/LobbyLeftColumn.js";
import { LobbyRightColumn } from "../lobby/LobbyRightColumn.js";
import { PlayerProfilePanel } from "../lobby/PlayerProfilePanel.js";
import { MatchSetupPanel } from "../lobby/MatchSetupPanel.js";
import { RoomPreviewPanel } from "../lobby/RoomPreviewPanel.js";
import { ExpeditionPanel } from "../lobby/ExpeditionPanel.js";
import { AvailableRoomsPanel } from "../lobby/AvailableRoomsPanel.js";
import { deriveRoomName } from "../lobby/roomPresentation.js";
import type { SeatData } from "../lobby/SeatPreview.js";
import type { LobbyAvatarID, LobbyColorID } from "../../features/lobby/lobbyStore.js";
import { resolveLobbyAvatarSrc, resolveLobbyColorValue } from "../../features/lobby/lobbyStore.js";

type LobbyScreenProps = {
  mode?: "create" | "join";
  onModeChange?: (mode: "create" | "join") => void;
  playerName: string;
  avatarID: LobbyAvatarID;
  colorID: LobbyColorID;
  numPlayers: number;
  selectedBotPlayerIDs: string[];
  players: string[];
  availableMatches: Array<{
    matchID: string;
    availableSeats: string[];
    occupiedSeats: string[];
    occupiedPlayers: Array<{ seat: string; name: string; isBot: boolean }>;
    totalPlayers: number;
  }>;
  selectedJoinMatchID: string;
  busy?: boolean;
  onPlayerNameChange?: (value: string) => void;
  onAvatarChange?: (avatarID: LobbyAvatarID) => void;
  onColorChange?: (colorID: LobbyColorID) => void;
  onNumPlayersChange?: (value: number) => void;
  onToggleBotPlayerID?: (playerID: string) => void;
  onSetBotPlayerIDs?: (ids: string[]) => void;
  onSelectJoinMatchID?: (matchID: string) => void;
  onRefreshMatches?: () => void;
  onCreate?: () => void;
  onJoin?: () => void;
};

export function LobbyScreen(props: LobbyScreenProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<"create" | "join">("create");
  const mode = props.mode ?? uncontrolledMode;
  const setMode = useCallback(
    (next: "create" | "join") => {
      if (props.onModeChange) {
        props.onModeChange(next);
      } else {
        setUncontrolledMode(next);
      }
    },
    [props.onModeChange]
  );
  const [previewTitle, setPreviewTitle] = useState("New Expedition Table");
  const [previewId, setPreviewId] = useState("FG-NEW");

  const maxBots = Math.max(0, props.numPlayers - 1);
  const botCount = Math.min(props.selectedBotPlayerIDs.length, maxBots);

  const setBotCount = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, maxBots));
      const candidates = Array.from({ length: maxBots }, (_, i) => String(i + 1));
      const target = candidates.slice(0, clamped);

      if (props.onSetBotPlayerIDs) {
        props.onSetBotPlayerIDs(target);
        return;
      }

      const currentSet = new Set(props.selectedBotPlayerIDs);
      const targetSet = new Set(target);

      for (const id of targetSet) {
        if (!currentSet.has(id)) props.onToggleBotPlayerID?.(id);
      }
      for (const id of currentSet) {
        if (!targetSet.has(id)) props.onToggleBotPlayerID?.(id);
      }
    },
    [maxBots, props.selectedBotPlayerIDs, props.onToggleBotPlayerID, props.onSetBotPlayerIDs]
  );

  const handleRandomize = useCallback(() => {
    const names = [
      "Frozen Dock",
      "Orca Table",
      "Penguin Vault",
      "Krill Alley",
      "Arctic Base",
      "Ice Cave",
      "Blizzard Peak",
    ];
    const id = Math.floor(1000 + Math.random() * 8999);
    setPreviewTitle(names[Math.floor(Math.random() * names.length)] ?? "New Expedition Table");
    setPreviewId(`FG-${id}`);
  }, []);

  const handleModeChange = useCallback(
    (next: "create" | "join") => {
      setMode(next);
      if (next === "create") {
        setPreviewTitle("New Expedition Table");
        setPreviewId("FG-NEW");
        props.onSelectJoinMatchID?.("");
      }
    },
    [setMode, props.onSelectJoinMatchID]
  );

  const handleViewRooms = useCallback(() => {
    setMode("join");
  }, [setMode]);

  const handleBackToExpedition = useCallback(() => {
    setMode("create");
    setPreviewTitle("New Expedition Table");
    setPreviewId("FG-NEW");
    props.onSelectJoinMatchID?.("");
  }, [setMode, props.onSelectJoinMatchID]);

  const waitingSeats = Math.max(0, props.numPlayers - 1 - botCount);

  const createSeats: SeatData[] = useMemo(() => {
    const total = props.numPlayers;
    const botStartIndex = total - botCount;
    const botNames = ["Bot Alpha", "Bot Beta", "Bot Gamma"];
    const localAvatarSrc = resolveLobbyAvatarSrc(props.avatarID);
    const localColor = resolveLobbyColorValue(props.colorID);

    return Array.from({ length: total }, (_, i) => {
      const isLocal = i === 0;
      const isBot = i >= botStartIndex;
      const isWaiting = !isLocal && !isBot;

      if (isLocal) {
        return {
          isLocal,
          isBot,
          isWaiting,
          name: props.playerName.trim() || "Unnamed Penguin",
          emoji: "🐧",
          avatarSrc: localAvatarSrc,
          color: localColor,
          status: "Local player",
          badge: "YOU",
        };
      }
      if (isBot) {
        return {
          isLocal,
          isBot,
          isWaiting,
          name: botNames[i - botStartIndex] ?? `Bot ${i - botStartIndex + 1}`,
          emoji: "⚙",
          status: "AI controlled seat",
          badge: "BOT",
        };
      }
      return {
        isLocal,
        isBot,
        isWaiting,
        name: "Waiting seat",
        emoji: "＋",
        status: "Available human slot",
        badge: "WAITING",
      };
    });
  }, [props.numPlayers, botCount, props.playerName, props.avatarID, props.colorID]);

  const joinSeats: SeatData[] = useMemo(() => {
    const match = props.availableMatches.find((m) => m.matchID === props.selectedJoinMatchID);
    if (!match) return [];

    const total = match.totalPlayers;
    const occupiedMap = new Map(match.occupiedPlayers.map((p) => [p.seat, p]));
    const joiningSeat = match.availableSeats[0] ?? "0";
    const localAvatarSrc = resolveLobbyAvatarSrc(props.avatarID);
    const localColor = resolveLobbyColorValue(props.colorID);
    const humanEmojis = ["🐧", "🦊", "🐋", "🦭"];

    return Array.from({ length: total }, (_, i) => {
      const seatStr = String(i);
      const occupied = occupiedMap.get(seatStr);
      const isLocal = seatStr === joiningSeat && !occupied;
      const isWaiting = !occupied;

      if (isLocal) {
        return {
          isLocal: true,
          isBot: false,
          isWaiting: false,
          name: props.playerName.trim() || "You",
          emoji: "🐧",
          avatarSrc: localAvatarSrc,
          color: localColor,
          status: "You will join here",
          badge: "YOU",
        };
      }

      if (occupied) {
        return {
          isLocal: false,
          isBot: occupied.isBot,
          isWaiting: false,
          name: occupied.name,
          emoji: occupied.isBot ? "⚙" : (humanEmojis[i] ?? "🐧"),
          status: occupied.isBot ? "AI controlled seat" : "Connected player",
          badge: occupied.isBot ? "BOT" : "HUMAN",
        };
      }
      return {
        isLocal: false,
        isBot: false,
        isWaiting: true,
        name: "Waiting seat",
        emoji: "＋",
        status: "Available human slot",
        badge: "WAITING",
      };
    });
  }, [props.selectedJoinMatchID, props.availableMatches, props.playerName, props.avatarID, props.colorID]);

  const isCreate = mode === "create";
  const seats = isCreate ? createSeats : joinSeats;

  const selectedMatch =
    props.availableMatches.find((m) => m.matchID === props.selectedJoinMatchID) ?? null;

  const joinableMatches = props.availableMatches.filter((m) => m.availableSeats.length > 0);

  const hasName = props.playerName.trim().length > 0;
  const canCreate = hasName;
  const canJoin = hasName && !!props.selectedJoinMatchID;

  const createCtaText = hasName ? "Create Match" : "Enter Nickname First";
  const joinCtaText = !hasName
    ? "Enter Nickname First"
    : !props.selectedJoinMatchID
      ? "Select a Room First"
      : "Join Selected Room";

  const handleCreate = () => {
    props.onCreate?.();
  };

  const footerHint = isCreate
    ? "Create a clean MVP room. Configure players and bots before opening the table."
    : "Pick a room on the right. The selected room appears here as read-only configuration.";

  return (
    <LobbyShell>
      <LobbyLeftColumn>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.crest} aria-hidden="true">
              <span className={styles.crestEmoji}>🐧</span>
            </div>
            <div>
              <h1 className={styles.title}>Lobby</h1>
              <p className={styles.subtitle}>Prepare your penguin, choose a room, enter El Hielo.</p>
            </div>
          </div>
          <div className={styles.pill}>
            <span className={styles.pillDot} />
            Server ready
          </div>
        </header>

        <PlayerProfilePanel
          playerName={props.playerName}
          avatarID={props.avatarID}
          colorID={props.colorID}
          onPlayerNameChange={props.onPlayerNameChange}
          onAvatarChange={props.onAvatarChange}
          onColorChange={props.onColorChange}
        />

        <MatchSetupPanel
          mode={mode}
          numPlayers={props.numPlayers}
          botCount={botCount}
          maxBots={maxBots}
          onModeChange={handleModeChange}
          onNumPlayersChange={props.onNumPlayersChange}
          onBotCountChange={setBotCount}
        />

        <RoomPreviewPanel
          mode={mode}
          previewTitle={isCreate ? previewTitle : (selectedMatch ? deriveRoomName(selectedMatch.matchID) : "No room selected")}
          previewId={isCreate ? previewId : (selectedMatch?.matchID ?? "")}
          numPlayers={props.numPlayers}
          botCount={botCount}
          waitingSeats={waitingSeats}
          seats={seats}
          selectedMatch={selectedMatch}
          onRandomize={handleRandomize}
        />

        <footer className={styles.actionsFooter}>
          <p className={styles.hint}>{footerHint}</p>
          {isCreate && (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleCreate}
              disabled={!canCreate || props.busy}
            >
              {createCtaText}
            </button>
          )}
        </footer>
      </LobbyLeftColumn>

      <LobbyRightColumn>
        <ExpeditionPanel active={isCreate} onViewRooms={handleViewRooms} />
        <AvailableRoomsPanel
          active={!isCreate}
          rows={joinableMatches}
          selectedMatchID={props.selectedJoinMatchID}
          busy={props.busy}
          onSelectMatchID={props.onSelectJoinMatchID}
          onBackToExpedition={handleBackToExpedition}
          onCreateFromEmpty={handleBackToExpedition}
          onJoin={props.onJoin}
          canJoin={canJoin}
          joinCtaText={joinCtaText}
        />
      </LobbyRightColumn>
    </LobbyShell>
  );
}
