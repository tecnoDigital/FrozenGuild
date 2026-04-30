import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{P as k}from"./PadrinoChoicePanel-CnI8xAGG.js";import{s as n}from"./Actions.module-D96rmHzj.js";import{B as c}from"./Button-KeV5yYt4.js";import{O as S}from"./OrcaResolutionPanel-BiHLBvC-.js";import{S as D}from"./SealExplosionPanel-lRriyBA4.js";function C({sourceLabel:r,targetLabel:d,canConfirm:t,helperText:o,options:l,sourceKey:a,targetKey:s,onSourceKeyChange:m,onTargetKeyChange:g,onConfirm:y,onClearSelection:v}){const p=!!a||!!s;return e.jsxs("div",{className:n.panelBlock,children:[e.jsx("p",{className:n.helper,children:o}),e.jsx("p",{className:n.helper,children:"Tambien puedes seleccionar cartas directo en el tablero y el ledger."}),e.jsxs("label",{className:n.helper,style:{opacity:p?.72:1},children:["Origen",e.jsxs("select",{className:n.select,value:a,onChange:u=>m(u.target.value),children:[e.jsx("option",{value:"",children:"Selecciona origen"}),l.map(u=>e.jsx("option",{value:u.key,children:u.label},`source-${u.key}`))]})]}),e.jsxs("label",{className:n.helper,style:{opacity:p?.72:1},children:["Destino",e.jsxs("select",{className:n.select,value:s,onChange:u=>g(u.target.value),children:[e.jsx("option",{value:"",children:"Selecciona destino"}),l.map(u=>e.jsx("option",{value:u.key,children:u.label},`target-${u.key}`))]})]}),e.jsxs("p",{className:n.helper,children:["Origen: ",r]}),e.jsxs("p",{className:n.helper,children:["Destino: ",d]}),e.jsxs("div",{className:n.actionRow,children:[e.jsx(c,{disabled:!t,onClick:y,children:"Confirmar intercambio"}),e.jsx(c,{onClick:v,children:"Limpiar seleccion"})]})]})}C.__docgenInfo={description:"",methods:[],displayName:"SwapConfirmPanel",props:{sourceLabel:{required:!0,tsType:{name:"string"},description:""},targetLabel:{required:!0,tsType:{name:"string"},description:""},canConfirm:{required:!0,tsType:{name:"boolean"},description:""},helperText:{required:!0,tsType:{name:"string"},description:""},options:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  key: string;
  label: string;
  location: SwapLocation;
}`,signature:{properties:[{key:"key",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"location",value:{name:"union",raw:`| {\r
    area: "ice_grid";\r
    slot: number;\r
  }\r
| {\r
    area: "player_zone";\r
    playerID: PlayerID;\r
    index: number;\r
  }`,elements:[{name:"signature",type:"object",raw:`{\r
  area: "ice_grid";\r
  slot: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{\r
  area: "player_zone";\r
  playerID: PlayerID;\r
  index: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"player_zone"',required:!0}},{key:"playerID",value:{name:"string",required:!0}},{key:"index",value:{name:"number",required:!0}}]}}],required:!0}}]}}],raw:"SwapOption[]"},description:""},sourceKey:{required:!0,tsType:{name:"string"},description:""},targetKey:{required:!0,tsType:{name:"string"},description:""},onSourceKeyChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(key: string) => void",signature:{arguments:[{type:{name:"string"},name:"key"}],return:{name:"void"}}},description:""},onTargetKeyChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(key: string) => void",signature:{arguments:[{type:{name:"string"},name:"key"}],return:{name:"void"}}},description:""},onConfirm:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClearSelection:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};function h({active:r,selectedSlots:d,availableSlots:t,revealedSlots:o,selectedGiftSlot:l,targetPlayerID:a,targetPlayerIDs:s,onToggleSlot:m,onSelectGiftSlot:g,onTargetPlayerChange:y,onConfirmSpy:v,onGiveCard:p,onCompleteSpy:u}){return r?e.jsxs(e.Fragment,{children:[e.jsx("p",{className:n.helper,children:"Selecciona una carta revelada para regalar o cierra el espionaje."}),e.jsx("div",{className:n.choiceList,children:o.map(i=>{const b=l===i;return e.jsxs("button",{type:"button",className:`${n.choiceButton} ${b?n.choiceButtonSelected:""}`,onClick:()=>g(i),children:["Slot ",i+1]},`spy-gift-slot-${i}`)})}),e.jsxs("label",{children:["Regalar a",e.jsx("select",{className:n.select,value:a,onChange:i=>y(i.target.value),children:s.map(i=>e.jsxs("option",{value:i,children:["Jugador ",i]},`spy-target-${i}`))})]}),e.jsxs("div",{className:n.actionRow,children:[e.jsx(c,{onClick:p,disabled:l===null||s.length===0,children:"Regalar carta vista"}),e.jsx(c,{onClick:u,children:"Cerrar espionaje"})]})]}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:n.helper,children:"Selecciona de 1 a 3 slots del Hielo para espiar."}),e.jsx("div",{className:n.choiceList,children:t.map(i=>{const b=d.includes(i);return e.jsxs("button",{type:"button",className:`${n.choiceButton} ${b?n.choiceButtonSelected:""}`,onClick:()=>m(i),children:["Slot ",i+1]},`spy-slot-${i}`)})}),e.jsx(c,{onClick:v,disabled:d.length===0,children:"Confirmar espionaje"})]})}h.__docgenInfo={description:"",methods:[],displayName:"SpyActionPanel",props:{active:{required:!0,tsType:{name:"boolean"},description:""},selectedSlots:{required:!0,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:""},availableSlots:{required:!0,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:""},revealedSlots:{required:!0,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:""},selectedGiftSlot:{required:!0,tsType:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}]},description:""},targetPlayerID:{required:!0,tsType:{name:"string"},description:""},targetPlayerIDs:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:""},onToggleSlot:{required:!0,tsType:{name:"signature",type:"function",raw:"(slot: number) => void",signature:{arguments:[{type:{name:"number"},name:"slot"}],return:{name:"void"}}},description:""},onSelectGiftSlot:{required:!0,tsType:{name:"signature",type:"function",raw:"(slot: number) => void",signature:{arguments:[{type:{name:"number"},name:"slot"}],return:{name:"void"}}},description:""},onTargetPlayerChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(playerID: string) => void",signature:{arguments:[{type:{name:"string"},name:"playerID"}],return:{name:"void"}}},description:""},onConfirmSpy:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onGiveCard:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCompleteSpy:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};function q(r){return r?r.area==="ice_grid"?`Hielo ${r.slot+1}`:`Jugador ${r.playerID} · carta ${r.index+1}`:"-"}function I({flow:r,onChoosePadrinoAction:d,swap:t,orca:o,seal:l,spy:a,onEndTurn:s}){const m=r.mode==="fish"?"/src/assets/fish.png":r.mode==="orca"?"/src/assets/orca.png":null,g=r.mode==="fish"?"Pesca":r.mode==="spy"?"Espionaje":r.mode==="swap"?"Intercambio":r.mode==="orca"?"Orca":r.mode==="seal"?"Foca-Bomba":r.mode==="padrino"?"Padrino":r.mode==="done"?"Fin de accion":r.mode==="roll"?"Dado":"Espera";return e.jsxs("div",{className:n.panelBlock,children:[e.jsxs("p",{className:n.helperRow,children:[m?e.jsx("img",{className:n.modeIcon,src:m,alt:"","aria-hidden":!0}):null,e.jsx("span",{className:n.modeChip,children:g}),e.jsx("span",{children:r.helperText})]}),r.mode==="padrino"?e.jsx(k,{onChoose:d}):null,r.mode==="swap"?e.jsx(C,{sourceLabel:q(t.source),targetLabel:q(t.target),canConfirm:t.canConfirm,helperText:t.helperText,sourceKey:t.sourceKey,targetKey:t.targetKey,options:t.options,onSourceKeyChange:t.onSourceKeyChange,onTargetKeyChange:t.onTargetKeyChange,onConfirm:t.onConfirm,onClearSelection:t.onClearSelection}):null,r.mode==="orca"&&o?e.jsx(S,{validTargetCardIDs:o.validTargetCardIDs,selectedCardID:o.selectedCardID,onSelectCardID:o.onSelectCardID,onResolve:o.onResolve}):null,r.mode==="seal"&&l?e.jsx(D,{validTargetCardIDs:l.validTargetCardIDs,selectedCardIDs:l.selectedCardIDs,requiredDiscardCount:l.requiredDiscardCount,onToggleCardID:l.onToggleCardID,onResolve:l.onResolve}):null,r.mode==="spy"&&a?e.jsx(h,{active:a.active,selectedSlots:a.selectedSlots,availableSlots:a.availableSlots,revealedSlots:a.revealedSlots,selectedGiftSlot:a.selectedGiftSlot,targetPlayerID:a.targetPlayerID,targetPlayerIDs:a.targetPlayerIDs,onToggleSlot:a.onToggleSlot,onSelectGiftSlot:a.onSelectGiftSlot,onTargetPlayerChange:a.onTargetPlayerChange,onConfirmSpy:a.onConfirmSpy,onGiveCard:a.onGiveCard,onCompleteSpy:a.onCompleteSpy}):null,r.canEndTurn?e.jsx(c,{onClick:s,children:"Terminar turno"}):null]})}I.__docgenInfo={description:"",methods:[],displayName:"ActionPanel",props:{flow:{required:!0,tsType:{name:"signature",type:"object",raw:`{
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
| "done"`,elements:[{name:"literal",value:'"waiting"'},{name:"literal",value:'"roll"'},{name:"literal",value:'"fish"'},{name:"literal",value:'"spy"'},{name:"literal",value:'"swap"'},{name:"literal",value:'"padrino"'},{name:"literal",value:'"orca"'},{name:"literal",value:'"seal"'},{name:"literal",value:'"done"'}],required:!0}},{key:"helperText",value:{name:"string",required:!0}},{key:"diceValue",value:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}],required:!0}},{key:"isMyTurn",value:{name:"boolean",required:!0}},{key:"canRoll",value:{name:"boolean",required:!0}},{key:"canEndTurn",value:{name:"boolean",required:!0}},{key:"showPadrinoOptions",value:{name:"boolean",required:!0}}]}},description:""},onChoosePadrinoAction:{required:!0,tsType:{name:"signature",type:"function",raw:"(action: 1 | 4 | 5) => void",signature:{arguments:[{type:{name:"union",raw:"1 | 4 | 5",elements:[{name:"literal",value:"1"},{name:"literal",value:"4"},{name:"literal",value:"5"}]},name:"action"}],return:{name:"void"}}},description:""},swap:{required:!0,tsType:{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"source",value:{name:"union",raw:"SwapLocation | null",elements:[{name:"union",raw:`| {\r
    area: "ice_grid";\r
    slot: number;\r
  }\r
| {\r
    area: "player_zone";\r
    playerID: PlayerID;\r
    index: number;\r
  }`,elements:[{name:"signature",type:"object",raw:`{\r
  area: "ice_grid";\r
  slot: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{\r
  area: "player_zone";\r
  playerID: PlayerID;\r
  index: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"player_zone"',required:!0}},{key:"playerID",value:{name:"string",required:!0}},{key:"index",value:{name:"number",required:!0}}]}}],required:!0},{name:"null"}],required:!0}},{key:"target",value:{name:"union",raw:"SwapLocation | null",elements:[{name:"union",raw:`| {\r
    area: "ice_grid";\r
    slot: number;\r
  }\r
| {\r
    area: "player_zone";\r
    playerID: PlayerID;\r
    index: number;\r
  }`,elements:[{name:"signature",type:"object",raw:`{\r
  area: "ice_grid";\r
  slot: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{\r
  area: "player_zone";\r
  playerID: PlayerID;\r
  index: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"player_zone"',required:!0}},{key:"playerID",value:{name:"string",required:!0}},{key:"index",value:{name:"number",required:!0}}]}}],required:!0},{name:"null"}],required:!0}},{key:"canConfirm",value:{name:"boolean",required:!0}},{key:"helperText",value:{name:"string",required:!0}},{key:"sourceKey",value:{name:"string",required:!0}},{key:"targetKey",value:{name:"string",required:!0}},{key:"options",value:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ key: string; label: string; location: SwapLocation }",signature:{properties:[{key:"key",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"location",value:{name:"union",raw:`| {\r
    area: "ice_grid";\r
    slot: number;\r
  }\r
| {\r
    area: "player_zone";\r
    playerID: PlayerID;\r
    index: number;\r
  }`,elements:[{name:"signature",type:"object",raw:`{\r
  area: "ice_grid";\r
  slot: number;\r
}`,signature:{properties:[{key:"area",value:{name:"literal",value:'"ice_grid"',required:!0}},{key:"slot",value:{name:"number",required:!0}}]}},{name:"signature",type:"object",raw:`{\r
  area: "player_zone";\r
  playerID: PlayerID;\r
  index: number;\r
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
}`,signature:{properties:[{key:"active",value:{name:"boolean",required:!0}},{key:"selectedSlots",value:{name:"Array",elements:[{name:"number"}],raw:"number[]",required:!0}},{key:"availableSlots",value:{name:"Array",elements:[{name:"number"}],raw:"number[]",required:!0}},{key:"revealedSlots",value:{name:"Array",elements:[{name:"number"}],raw:"number[]",required:!0}},{key:"selectedGiftSlot",value:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}],required:!0}},{key:"targetPlayerID",value:{name:"string",required:!0}},{key:"targetPlayerIDs",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"onToggleSlot",value:{name:"signature",type:"function",raw:"(slot: number) => void",signature:{arguments:[{type:{name:"number"},name:"slot"}],return:{name:"void"}},required:!0}},{key:"onSelectGiftSlot",value:{name:"signature",type:"function",raw:"(slot: number) => void",signature:{arguments:[{type:{name:"number"},name:"slot"}],return:{name:"void"}},required:!0}},{key:"onTargetPlayerChange",value:{name:"signature",type:"function",raw:"(playerID: string) => void",signature:{arguments:[{type:{name:"string"},name:"playerID"}],return:{name:"void"}},required:!0}},{key:"onConfirmSpy",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}},{key:"onGiveCard",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}},{key:"onCompleteSpy",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},{name:"null"}]},description:""},onEndTurn:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};export{I as A};
