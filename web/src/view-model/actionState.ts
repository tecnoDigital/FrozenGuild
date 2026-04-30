import type { FrozenGuildUiStore } from "../store/frozenGuildStore.js";
import { selectActionBannerView, selectDiceView } from "../store/selectors.js";

export type ActionStateView = {
  bannerTitle: string;
  bannerDetail: string;
  diceValue: number | null;
  diceRolled: boolean;
  diceDisabled: boolean;
};

export function makeActionState(state: FrozenGuildUiStore): ActionStateView {
  const banner = selectActionBannerView(state);
  const dice = selectDiceView(state);
  return {
    bannerTitle: banner.title,
    bannerDetail: banner.detail,
    diceValue: dice.value,
    diceRolled: dice.rolled,
    diceDisabled: dice.disabled
  };
}
