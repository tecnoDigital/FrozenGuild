import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as o}from"./iframe-BJe43DDv.js";import{B as E}from"./BottomSheet-E0MeFSet.js";import"./preload-helper-Dp1pzeXC.js";const q="_mobileRoot_vc8fj_1",_="_mobileBoardSticky_vc8fj_6",O="_mobileSummary_vc8fj_17",d={mobileRoot:q,mobileBoardSticky:_,mobileSummary:O};function g({board:x,summary:S,actions:M,hand:R,rivals:j,flow:a}){const[c,l]=o.useState("action"),[n,r]=o.useState("collapsed"),w=o.useMemo(()=>a.isMyTurn?"action":c,[c,a.isMyTurn]);return o.useEffect(()=>{if(a.mode==="orca"||a.mode==="seal"){l("action"),r("half");return}if(a.isMyTurn){l("action"),n==="collapsed"&&r("half");return}!a.isMyTurn&&n==="expanded"&&r("collapsed")},[a.isMyTurn,a.mode,n]),e.jsxs("section",{className:d.mobileRoot,children:[e.jsx("div",{className:d.mobileBoardSticky,children:x}),e.jsx("div",{className:d.mobileSummary,children:S}),e.jsx(E,{state:n,activeTab:w,onStateChange:r,onTabChange:k=>{l(k),n==="collapsed"&&r("half")},actionContent:M,handContent:R,rivalsContent:j})]})}g.__docgenInfo={description:"",methods:[],displayName:"MobileGameShell",props:{board:{required:!0,tsType:{name:"ReactNode"},description:""},summary:{required:!0,tsType:{name:"ReactNode"},description:""},actions:{required:!0,tsType:{name:"ReactNode"},description:""},hand:{required:!0,tsType:{name:"ReactNode"},description:""},rivals:{required:!0,tsType:{name:"ReactNode"},description:""},flow:{required:!0,tsType:{name:"signature",type:"object",raw:`{
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
| "done"`,elements:[{name:"literal",value:'"waiting"'},{name:"literal",value:'"roll"'},{name:"literal",value:'"fish"'},{name:"literal",value:'"spy"'},{name:"literal",value:'"swap"'},{name:"literal",value:'"padrino"'},{name:"literal",value:'"orca"'},{name:"literal",value:'"seal"'},{name:"literal",value:'"done"'}],required:!0}},{key:"helperText",value:{name:"string",required:!0}},{key:"diceValue",value:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}],required:!0}},{key:"isMyTurn",value:{name:"boolean",required:!0}},{key:"canRoll",value:{name:"boolean",required:!0}},{key:"canEndTurn",value:{name:"boolean",required:!0}},{key:"showPadrinoOptions",value:{name:"boolean",required:!0}}]}},description:""}}};const C={title:"Mobile/MobileGameShell",component:g,args:{board:e.jsx("div",{children:"ActionBanner + Hielo 3x3 sticky"}),summary:e.jsx("div",{children:"Estado de mesa y turno"}),actions:e.jsx("div",{children:"Panel de acciones"}),hand:e.jsx("div",{children:"Mi mano"}),rivals:e.jsx("div",{children:"Rivales"}),flow:{mode:"roll",helperText:"Tu turno: lanza el dado.",diceValue:null,isMyTurn:!0,canRoll:!0,canEndTurn:!1,showPadrinoOptions:!1}}},i={},s={args:{flow:{mode:"waiting",helperText:"Esperando a jugador 1.",diceValue:3,isMyTurn:!1,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1}}},t={args:{flow:{mode:"orca",helperText:"Orca pendiente.",diceValue:6,isMyTurn:!0,canRoll:!1,canEndTurn:!1,showPadrinoOptions:!1}}};var u,m,p;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(p=(m=i.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var y,h,T;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    flow: {
      mode: "waiting",
      helperText: "Esperando a jugador 1.",
      diceValue: 3,
      isMyTurn: false,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
}`,...(T=(h=s.parameters)==null?void 0:h.docs)==null?void 0:T.source}}};var f,b,v;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    flow: {
      mode: "orca",
      helperText: "Orca pendiente.",
      diceValue: 6,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
}`,...(v=(b=t.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};const G=["MyTurn","Waiting","BlockingOrca"];export{t as BlockingOrca,i as MyTurn,s as Waiting,G as __namedExportsOrder,C as default};
