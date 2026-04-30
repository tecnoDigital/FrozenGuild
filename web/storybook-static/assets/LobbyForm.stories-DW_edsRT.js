import{L as p}from"./LobbyForm-TfI7NfJj.js";import"./jsx-runtime-D_zvdyIk.js";import"./Button-KeV5yYt4.js";import"./Lobby.module-OZmPMUJ1.js";const{expect:u,fn:e,userEvent:y}=__STORYBOOK_MODULE_TEST__,D={title:"Lobby/LobbyForm",component:p,args:{playerName:"Jugador",matchID:"match-001",playerID:"0",numPlayers:4,botPlayerIDs:["2"],onCreate:e(),onJoin:e(),onNumPlayersChange:e(),onToggleBotPlayerID:e()}},a={},o={play:async({canvas:m,args:i})=>{await y.click(m.getByRole("button",{name:"Romper el hielo"})),await u(i.onJoin).toHaveBeenCalled()}};var r,t,n;a.parameters={...a.parameters,docs:{...(r=a.parameters)==null?void 0:r.docs,source:{originalSource:"{}",...(n=(t=a.parameters)==null?void 0:t.docs)==null?void 0:n.source}}};var s,c,l;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  play: async ({
    canvas,
    args
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Romper el hielo"
    }));
    await expect(args.onJoin).toHaveBeenCalled();
  }
}`,...(l=(c=o.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const v=["Default","ClickJoin"];export{o as ClickJoin,a as Default,v as __namedExportsOrder,D as default};
