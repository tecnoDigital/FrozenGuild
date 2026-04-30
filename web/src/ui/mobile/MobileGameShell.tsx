import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ActionFlowView } from "../../store/selectors.js";
import { BottomSheet, type BottomSheetState, type BottomSheetTab } from "./BottomSheet.js";
import styles from "./MobileGameShell.module.css";

type MobileGameShellProps = {
  board: ReactNode;
  summary: ReactNode;
  actions: ReactNode;
  hand: ReactNode;
  rivals: ReactNode;
  flow: ActionFlowView;
};

export function MobileGameShell({ board, summary, actions, hand, rivals, flow }: MobileGameShellProps) {
  const [activeTab, setActiveTab] = useState<BottomSheetTab>("action");
  const [sheetState, setSheetState] = useState<BottomSheetState>("collapsed");

  const preferredTab = useMemo<BottomSheetTab>(() => {
    if (flow.isMyTurn) {
      return "action";
    }
    return activeTab;
  }, [activeTab, flow.isMyTurn]);

  useEffect(() => {
    if (flow.mode === "orca" || flow.mode === "seal") {
      setActiveTab("action");
      setSheetState("half");
      return;
    }
    if (flow.isMyTurn) {
      setActiveTab("action");
      if (sheetState === "collapsed") {
        setSheetState("half");
      }
      return;
    }
    if (!flow.isMyTurn && sheetState === "expanded") {
      setSheetState("collapsed");
    }
  }, [flow.isMyTurn, flow.mode, sheetState]);

  return (
    <section className={styles.mobileRoot}>
      <div className={styles.mobileBoardSticky}>{board}</div>
      <div className={styles.mobileSummary}>{summary}</div>

      <BottomSheet
        state={sheetState}
        activeTab={preferredTab}
        onStateChange={setSheetState}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (sheetState === "collapsed") {
            setSheetState("half");
          }
        }}
        actionContent={actions}
        handContent={hand}
        rivalsContent={rivals}
      />
    </section>
  );
}
