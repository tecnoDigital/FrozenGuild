import type { BottomSheetTab } from "./BottomSheet.js";
import styles from "./BottomSheet.module.css";

type MobileTabsProps = {
  activeTab: BottomSheetTab;
  onTabChange: (tab: BottomSheetTab) => void;
};

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  return (
    <div className={styles.tabRow}>
      <button type="button" className={`${styles.tab} ${activeTab === "action" ? styles.tabActive : ""}`} onClick={() => onTabChange("action")}>Accion</button>
      <button type="button" className={`${styles.tab} ${activeTab === "hand" ? styles.tabActive : ""}`} onClick={() => onTabChange("hand")}>Mi mano</button>
      <button type="button" className={`${styles.tab} ${activeTab === "rivals" ? styles.tabActive : ""}`} onClick={() => onTabChange("rivals")}>Rivales</button>
    </div>
  );
}
