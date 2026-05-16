import{L as i}from"./LobbyForm-CSF810CZ.js";import"./jsx-runtime-D_zvdyIk.js";import"./Button-KeV5yYt4.js";import"./Lobby.module-CDuYn-Ok.js";const{expect:u,fn:r,userEvent:d}=__STORYBOOK_MODULE_TEST__,_={title:"Lobby/LobbyForm",component:i,args:{playerName:"Jugador",numPlayers:4,botPlayerIDs:["2"],onCreate:r(),onNumPlayersChange:r(),onToggleBotPlayerID:r()}},e={},a={play:async({canvas:m,args:p})=>{await d.click(m.getByRole("button",{name:"Crear partida"})),await u(p.onCreate).toHaveBeenCalled()}};var t,o,n;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var s,c,l;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
  play: async ({
    canvas,
    args
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Crear partida"
    }));
    await expect(args.onCreate).toHaveBeenCalled();
  }
}`,...(l=(c=a.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const v=["Default","ClickCreate"];export{a as ClickCreate,e as Default,v as __namedExportsOrder,_ as default};
