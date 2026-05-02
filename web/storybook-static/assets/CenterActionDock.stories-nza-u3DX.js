import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{D as f}from"./DicePanel-iyrvPOQJ.js";import{A as I}from"./ActionPanel-BwKOmz9c.js";import"./Actions.module-CnGrQd0a.js";import"./Button-KeV5yYt4.js";import"./PadrinoChoicePanel-CZ3OnYT8.js";import"./OrcaResolutionPanel-Bhui5Fue.js";import"./SealExplosionPanel-B1j9W3lf.js";function m({rolled:d,value:g,disabled:y,onRoll:p,flow:c,onChoosePadrinoAction:v,onEndTurn:b,swap:w,orca:q,seal:k,spy:D}){return a.jsxs("div",{children:[a.jsx(f,{rolled:d,value:g,disabled:y,onRoll:p}),a.jsx(I,{flow:c,onChoosePadrinoAction:v,onEndTurn:b,swap:w,orca:q,seal:k,spy:D})]})}m.__docgenInfo={description:"",methods:[],displayName:"CenterActionDock",props:{rolled:{required:!0,tsType:{name:"boolean"},description:""},value:{required:!0,tsType:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}]},description:""},disabled:{required:!0,tsType:{name:"boolean"},description:""},onRoll:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},flow:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  mode:
    | "waiting"
    | "roll"
    | "fish"
    | "spy"
    | "swap"
    | "padrino"
    | "orca"
    | "seal"
    | "done";
  helperText: string;
  diceValue: number | null;
  isMyTurn: boolean;
  canRoll: boolean;
  canEndTurn: boolean;
  showPadrinoOptions: boolean;
}`,signature:{properties:[{key:"mode",value:{name:"union",raw:`| "waiting"
| "roll"
| "fish"
| "spy"
| "swap"
| "padrino"
| "orca"
| "seal"
| "done"`,elements:[{name:"literal",value:'"waiting"'},{name:"literal",value:'"roll"'},{name:"literal",value:'"fish"'},{name:"literal",value:'"spy"'},{name:"literal",value:'"swap"'},{name:"literal",value:'"padrino"'},{name:"literal",value:'"orca"'},{name:"literal",value:'"seal"'},{name:"literal",value:'"done"'}],required:!0}},{key:"helperText",value:{name:"string",required:!0}},{key:"diceValue",value:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}],required:!0}},{key:"isMyTurn",value:{name:"boolean",required:!0}},{key:"canRoll",value:{name:"boolean",required:!0}},{key:"canEndTurn",value:{name:"boolean",required:!0}},{key:"showPadrinoOptions",value:{name:"boolean",required:!0}}]}},description:""},onChoosePadrinoAction:{required:!0,tsType:{name:"signature",type:"function",raw:"(action: 1 | 4 | 5) => void",signature:{arguments:[{type:{name:"union",raw:"1 | 4 | 5",elements:[{name:"literal",value:"1"},{name:"literal",value:"4"},{name:"literal",value:"5"}]},name:"action"}],return:{name:"void"}}},description:""},onEndTurn:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},swap:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  source: SwapLocation | null;
  target: SwapLocation | null;
  canConfirm: boolean;
  helperText: string;
  sourceKey: string;
  targetKey: string;
  options: Array<{ key: string; label: string; location: SwapLocation }>;
  onSourceKeyChange: (key: string) => void;
  onTargetKeyChange: (key: string) => void;
  onConfirm: () => void;
  onClearSelection: () => void;
}`,signature:{properties:[{key:"source",value:{name:"union",raw:"SwapLocation | null",elements:[{name:"union",raw:`| {
    area: "ice_grid";
    slot: number;
  }
| {
    area: "player_zone";
    playerID: PlayerID;
    index: number;
  }`,elements:[{name:"signature",type:"object",raw:`{
  area: "ice_grid";
  slot: number;
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{
  area: "player_zone";
  playerID: PlayerID;
  index: number;
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"player_zone"',required:!0}},{key:"playerID",value:{name:"string",required:!0}},{key:"index",value:{name:"number",required:!0}}]}}],required:!0},{name:"null"}],required:!0}},{key:"target",value:{name:"union",raw:"SwapLocation | null",elements:[{name:"union",raw:`| {
    area: "ice_grid";
    slot: number;
  }
| {
    area: "player_zone";
    playerID: PlayerID;
    index: number;
  }`,elements:[{name:"signature",type:"object",raw:`{
  area: "ice_grid";
  slot: number;
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{
  area: "player_zone";
  playerID: PlayerID;
  index: number;
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"player_zone"',required:!0}},{key:"playerID",value:{name:"string",required:!0}},{key:"index",value:{name:"number",required:!0}}]}}],required:!0},{name:"null"}],required:!0}},{key:"canConfirm",value:{name:"boolean",required:!0}},{key:"helperText",value:{name:"string",required:!0}},{key:"sourceKey",value:{name:"string",required:!0}},{key:"targetKey",value:{name:"string",required:!0}},{key:"options",value:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ key: string; label: string; location: SwapLocation }",signature:{properties:[{key:"key",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"location",value:{name:"union",raw:`| {
    area: "ice_grid";
    slot: number;
  }
| {
    area: "player_zone";
    playerID: PlayerID;
    index: number;
  }`,elements:[{name:"signature",type:"object",raw:`{
  area: "ice_grid";
  slot: number;
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{
  area: "player_zone";
  playerID: PlayerID;
  index: number;
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"player_zone"',required:!0}},{key:"playerID",value:{name:"string",required:!0}},{key:"index",value:{name:"number",required:!0}}]}}],required:!0}}]}}],raw:"Array<{ key: string; label: string; location: SwapLocation }>",required:!0}},{key:"onSourceKeyChange",value:{name:"signature",type:"function",raw:"(key: string) => void",signature:{arguments:[{type:{name:"string"},name:"key"}],return:{name:"void"}},required:!0}},{key:"onTargetKeyChange",value:{name:"signature",type:"function",raw:"(key: string) => void",signature:{arguments:[{type:{name:"string"},name:"key"}],return:{name:"void"}},required:!0}},{key:"onConfirm",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}},{key:"onClearSelection",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},description:""},orca:{required:!0,tsType:{name:"union",raw:`{
  validTargetCardIDs: string[];
  selectedCardID: string | null;
  onSelectCardID: (cardID: string) => void;
  onResolve: () => void;
} | null`,elements:[{name:"signature",type:"object",raw:`{
  validTargetCardIDs: string[];
  selectedCardID: string | null;
  onSelectCardID: (cardID: string) => void;
  onResolve: () => void;
}`,signature:{properties:[{key:"validTargetCardIDs",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"selectedCardID",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"onSelectCardID",value:{name:"signature",type:"function",raw:"(cardID: string) => void",signature:{arguments:[{type:{name:"string"},name:"cardID"}],return:{name:"void"}},required:!0}},{key:"onResolve",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},{name:"null"}]},description:""},seal:{required:!0,tsType:{name:"union",raw:`{
  validTargetCardIDs: string[];
  selectedCardIDs: string[];
  requiredDiscardCount: number;
  onToggleCardID: (cardID: string) => void;
  onResolve: () => void;
} | null`,elements:[{name:"signature",type:"object",raw:`{
  validTargetCardIDs: string[];
  selectedCardIDs: string[];
  requiredDiscardCount: number;
  onToggleCardID: (cardID: string) => void;
  onResolve: () => void;
}`,signature:{properties:[{key:"validTargetCardIDs",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"selectedCardIDs",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"requiredDiscardCount",value:{name:"number",required:!0}},{key:"onToggleCardID",value:{name:"signature",type:"function",raw:"(cardID: string) => void",signature:{arguments:[{type:{name:"string"},name:"cardID"}],return:{name:"void"}},required:!0}},{key:"onResolve",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},{name:"null"}]},description:""},spy:{required:!0,tsType:{name:"union",raw:`{
  active: boolean;
  selectedSlots: number[];
  availableSlots: number[];
  revealedSlots: number[];
  selectedGiftSlot: number | null;
  targetPlayerID: string;
  targetPlayerIDs: string[];
  onToggleSlot: (slot: number) => void;
  onSelectGiftSlot: (slot: number) => void;
  onTargetPlayerChange: (playerID: string) => void;
  onConfirmSpy: () => void;
  onGiveCard: () => void;
  onCompleteSpy: () => void;
} | null`,elements:[{name:"signature",type:"object",raw:`{
  active: boolean;
  selectedSlots: number[];
  availableSlots: number[];
  revealedSlots: number[];
  selectedGiftSlot: number | null;
  targetPlayerID: string;
  targetPlayerIDs: string[];
  onToggleSlot: (slot: number) => void;
  onSelectGiftSlot: (slot: number) => void;
  onTargetPlayerChange: (playerID: string) => void;
  onConfirmSpy: () => void;
  onGiveCard: () => void;
  onCompleteSpy: () => void;
}`,signature:{properties:[{key:"active",value:{name:"boolean",required:!0}},{key:"selectedSlots",value:{name:"Array",elements:[{name:"number"}],raw:"number[]",required:!0}},{key:"availableSlots",value:{name:"Array",elements:[{name:"number"}],raw:"number[]",required:!0}},{key:"revealedSlots",value:{name:"Array",elements:[{name:"number"}],raw:"number[]",required:!0}},{key:"selectedGiftSlot",value:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}],required:!0}},{key:"targetPlayerID",value:{name:"string",required:!0}},{key:"targetPlayerIDs",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"onToggleSlot",value:{name:"signature",type:"function",raw:"(slot: number) => void",signature:{arguments:[{type:{name:"number"},name:"slot"}],return:{name:"void"}},required:!0}},{key:"onSelectGiftSlot",value:{name:"signature",type:"function",raw:"(slot: number) => void",signature:{arguments:[{type:{name:"number"},name:"slot"}],return:{name:"void"}},required:!0}},{key:"onTargetPlayerChange",value:{name:"signature",type:"function",raw:"(playerID: string) => void",signature:{arguments:[{type:{name:"string"},name:"playerID"}],return:{name:"void"}},required:!0}},{key:"onConfirmSpy",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}},{key:"onGiveCard",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}},{key:"onCompleteSpy",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},{name:"null"}]},description:""}}};const{fn:e}=__STORYBOOK_MODULE_TEST__,A={title:"Layout/CenterActionDock",component:m,args:{rolled:!0,value:6,disabled:!1,onRoll:e(),onChoosePadrinoAction:e(),onEndTurn:e(),flow:{mode:"padrino",helperText:"El Padrino: elige una accion 1-5.",diceValue:6,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!0},swap:{source:null,target:null,canConfirm:!1,helperText:"",sourceKey:"",targetKey:"",options:[],onSourceKeyChange:e(),onTargetKeyChange:e(),onConfirm:e(),onClearSelection:e()},orca:null,seal:null,spy:null}},n={},r={args:{value:5,flow:{mode:"swap",helperText:"Intercambio: elige carta origen y luego destino.",diceValue:5,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1}}};var t,i,u;n.parameters={...n.parameters,docs:{...(t=n.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(u=(i=n.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};var o,l,s;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    value: 5,
    flow: {
      mode: "swap",
      helperText: "Intercambio: elige carta origen y luego destino.",
      diceValue: 5,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
}`,...(s=(l=r.parameters)==null?void 0:l.docs)==null?void 0:s.source}}};const R=["PadrinoVisible","Hidden"];export{r as Hidden,n as PadrinoVisible,R as __namedExportsOrder,A as default};
