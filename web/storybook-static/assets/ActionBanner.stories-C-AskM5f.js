import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{s as e}from"./Actions.module-CnGrQd0a.js";function k({title:N,detail:A,severity:r="neutral",mode:i="waiting"}){const B=r==="your-turn"?e.bannerYourTurn:r==="blocked"?e.bannerBlocked:r==="danger"?e.bannerDanger:r==="success"?e.bannerSuccess:e.bannerNeutral,u=i==="fish"?"/src/assets/fish.png":i==="orca"?"/src/assets/orca.png":null;return a.jsxs("div",{className:`${e.banner} ${B}`,children:[a.jsxs("strong",{className:e.bannerTitle,children:[u?a.jsx("img",{className:e.bannerModeIcon,src:u,alt:"","aria-hidden":!0}):null,a.jsx("span",{children:N})]}),a.jsx("p",{style:{margin:"6px 0 0"},children:A})]})}k.__docgenInfo={description:"",methods:[],displayName:"ActionBanner",props:{title:{required:!0,tsType:{name:"string"},description:""},detail:{required:!0,tsType:{name:"string"},description:""},severity:{required:!1,tsType:{name:"union",raw:'"neutral" | "your-turn" | "blocked" | "danger" | "success"',elements:[{name:"literal",value:'"neutral"'},{name:"literal",value:'"your-turn"'},{name:"literal",value:'"blocked"'},{name:"literal",value:'"danger"'},{name:"literal",value:'"success"'}]},description:"",defaultValue:{value:'"neutral"',computed:!1}},mode:{required:!1,tsType:{name:"union",raw:'"waiting" | "roll" | "fish" | "spy" | "swap" | "padrino" | "orca" | "seal" | "done"',elements:[{name:"literal",value:'"waiting"'},{name:"literal",value:'"roll"'},{name:"literal",value:'"fish"'},{name:"literal",value:'"spy"'},{name:"literal",value:'"swap"'},{name:"literal",value:'"padrino"'},{name:"literal",value:'"orca"'},{name:"literal",value:'"seal"'},{name:"literal",value:'"done"'}]},description:"",defaultValue:{value:'"waiting"',computed:!1}}}};const E={title:"Actions/ActionBanner",component:k,args:{title:"Tu turno",detail:"Lanza el dado."}},n={args:{title:"Sin partida",detail:"Crea o unete a una sala.",severity:"neutral",mode:"waiting"}},t={args:{title:"Tu turno",detail:"Lanza el dado.",severity:"your-turn",mode:"roll"}},s={args:{title:"Esperando turno",detail:"Turno de jugador 1.",severity:"blocked",mode:"waiting"}},o={args:{title:"Orca pendiente",detail:"Debes destruir una carta propia para continuar.",severity:"danger",mode:"orca"}},l={args:{title:"Accion completada",detail:"Termina tu turno para continuar.",severity:"success",mode:"done"}};var c,d,m;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    title: "Sin partida",
    detail: "Crea o unete a una sala.",
    severity: "neutral",
    mode: "waiting"
  }
}`,...(m=(d=n.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,g,v;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    title: "Tu turno",
    detail: "Lanza el dado.",
    severity: "your-turn",
    mode: "roll"
  }
}`,...(v=(g=t.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var y,b,f;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: "Esperando turno",
    detail: "Turno de jugador 1.",
    severity: "blocked",
    mode: "waiting"
  }
}`,...(f=(b=s.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var T,w,h;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    title: "Orca pendiente",
    detail: "Debes destruir una carta propia para continuar.",
    severity: "danger",
    mode: "orca"
  }
}`,...(h=(w=o.parameters)==null?void 0:w.docs)==null?void 0:h.source}}};var x,S,j;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    title: "Accion completada",
    detail: "Termina tu turno para continuar.",
    severity: "success",
    mode: "done"
  }
}`,...(j=(S=l.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};const _=["Neutral","YourTurn","Blocked","Danger","Success"];export{s as Blocked,o as Danger,n as Neutral,l as Success,t as YourTurn,_ as __namedExportsOrder,E as default};
