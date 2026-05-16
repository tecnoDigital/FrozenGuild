import{A as w}from"./ActionPanel-BwKOmz9c.js";import"./jsx-runtime-D_zvdyIk.js";import"./PadrinoChoicePanel-CZ3OnYT8.js";import"./Button-KeV5yYt4.js";import"./Actions.module-CnGrQd0a.js";import"./OrcaResolutionPanel-Bhui5Fue.js";import"./SealExplosionPanel-B1j9W3lf.js";const{fn:e}=__STORYBOOK_MODULE_TEST__,R={title:"Actions/ActionPanel",component:w,args:{flow:{mode:"swap",helperText:"Intercambio: elige carta origen y luego destino.",diceValue:5,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1},onChoosePadrinoAction:e(),onEndTurn:e(),swap:{source:{area:"ice_grid",slot:0},target:{area:"player_zone",playerID:"0",index:0},canConfirm:!0,helperText:"Listo para confirmar intercambio.",sourceKey:"ice:0",targetKey:"player:0:0",options:[{key:"ice:0",label:"Hielo 1",location:{area:"ice_grid",slot:0}},{key:"player:0:0",label:"Jugador 0 · penguin-001",location:{area:"player_zone",playerID:"0",index:0}}],onSourceKeyChange:e(),onTargetKeyChange:e(),onConfirm:e(),onClearSelection:e()},orca:null,seal:null,spy:null}},n={},a={args:{flow:{mode:"padrino",helperText:"El Padrino: elige una accion 1-5.",diceValue:6,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!0}}},r={args:{flow:{mode:"spy",helperText:"Espionaje: selecciona slots y confirma.",diceValue:4,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1},spy:{active:!1,selectedSlots:[0,3],availableSlots:[0,1,2,3,4,5],revealedSlots:[],selectedGiftSlot:null,targetPlayerID:"1",targetPlayerIDs:["1","2"],onToggleSlot:e(),onSelectGiftSlot:e(),onTargetPlayerChange:e(),onConfirmSpy:e(),onGiveCard:e(),onCompleteSpy:e()}}},o={args:{flow:{mode:"orca",helperText:"Orca pendiente: destruye una carta propia para continuar.",diceValue:3,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1},orca:{validTargetCardIDs:["penguin-001","walrus-001"],selectedCardID:"penguin-001",onSelectCardID:e(),onResolve:e()}}},s={args:{flow:{mode:"seal",helperText:"Foca-Bomba pendiente: descarta cartas para resolver.",diceValue:2,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1},seal:{validTargetCardIDs:["penguin-001","penguin-002","krill-001"],selectedCardIDs:["penguin-001"],requiredDiscardCount:2,onToggleCardID:e(),onResolve:e()}}};var l,t,i;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(i=(t=n.parameters)==null?void 0:t.docs)==null?void 0:i.source}}};var c,d,p;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    flow: {
      mode: "padrino",
      helperText: "El Padrino: elige una accion 1-5.",
      diceValue: 6,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: true
    }
  }
}`,...(p=(d=a.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var u,f,g;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    flow: {
      mode: "spy",
      helperText: "Espionaje: selecciona slots y confirma.",
      diceValue: 4,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    spy: {
      active: false,
      selectedSlots: [0, 3],
      availableSlots: [0, 1, 2, 3, 4, 5],
      revealedSlots: [],
      selectedGiftSlot: null,
      targetPlayerID: "1",
      targetPlayerIDs: ["1", "2"],
      onToggleSlot: fn(),
      onSelectGiftSlot: fn(),
      onTargetPlayerChange: fn(),
      onConfirmSpy: fn(),
      onGiveCard: fn(),
      onCompleteSpy: fn()
    }
  }
}`,...(g=(f=r.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var m,y,T;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    flow: {
      mode: "orca",
      helperText: "Orca pendiente: destruye una carta propia para continuar.",
      diceValue: 3,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    orca: {
      validTargetCardIDs: ["penguin-001", "walrus-001"],
      selectedCardID: "penguin-001",
      onSelectCardID: fn(),
      onResolve: fn()
    }
  }
}`,...(T=(y=o.parameters)==null?void 0:y.docs)==null?void 0:T.source}}};var S,C,h;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    flow: {
      mode: "seal",
      helperText: "Foca-Bomba pendiente: descarta cartas para resolver.",
      diceValue: 2,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    seal: {
      validTargetCardIDs: ["penguin-001", "penguin-002", "krill-001"],
      selectedCardIDs: ["penguin-001"],
      requiredDiscardCount: 2,
      onToggleCardID: fn(),
      onResolve: fn()
    }
  }
}`,...(h=(C=s.parameters)==null?void 0:C.docs)==null?void 0:h.source}}};const _=["Swap","Padrino","Spy","Orca","SealBomb"];export{o as Orca,a as Padrino,s as SealBomb,r as Spy,n as Swap,_ as __namedExportsOrder,R as default};
