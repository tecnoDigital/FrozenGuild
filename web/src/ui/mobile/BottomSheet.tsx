import { useMemo } from "react";
import type { ReactNode } from "react";
import styles from "./BottomSheet.module.css";
import { MobileTabs } from "./MobileTabs.js";

export type BottomSheetTab = "action" | "hand" | "rivals";
export type BottomSheetState = "collapsed" | "half" | "expanded";

type BottomSheetProps = {
  state: BottomSheetState;
  activeTab: BottomSheetTab;
  onStateChange: (next: BottomSheetState) => void;
  onTabChange: (tab: BottomSheetTab) => void;
  actionContent: ReactNode;
  handContent: ReactNode;
  rivalsContent: ReactNode;
};

export function BottomSheet({ state, activeTab, onStateChange, onTabChange, actionContent, handContent, rivalsContent }: BottomSheetProps) {
  const stateClass = state === "collapsed" ? styles.sheetCollapsed : state === "half" ? styles.sheetHalf : styles.sheetExpanded;

  const currentContent = useMemo(() => {
    if (activeTab === "action") {
      return actionContent;
    }
    if (activeTab === "hand") {
      return handContent;
    }
    return rivalsContent;
  }, [actionContent, activeTab, handContent, rivalsContent]);

  const statusText = activeTab === "action" ? "Accion" : activeTab === "hand" ? "Mi mano" : "Rivales";

  return (
    <section className={`${styles.sheet} ${stateClass}`}>
      <button type="button" className={styles.handle} onClick={() => onStateChange(state === "collapsed" ? "half" : state === "half" ? "expanded" : "collapsed")}>
        <span className={styles.handleBar} />
        <span className={styles.handleLabel}>{statusText}</span>
      </button>

      <MobileTabs activeTab={activeTab} onTabChange={onTabChange} />

      {state !== "collapsed" ? <div className={styles.content}>{currentContent}</div> : null}
    </section>
  );
}
