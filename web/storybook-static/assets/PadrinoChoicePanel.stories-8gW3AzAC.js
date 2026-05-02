import{P as c}from"./PadrinoChoicePanel-CZ3OnYT8.js";import"./jsx-runtime-D_zvdyIk.js";import"./Button-KeV5yYt4.js";import"./Actions.module-CnGrQd0a.js";const{expect:r,fn:i,userEvent:l}=__STORYBOOK_MODULE_TEST__,o=i(),_={title:"Actions/PadrinoChoicePanel",component:c,args:{onChoose:o}},e={play:async({canvas:s})=>{await l.click(s.getByRole("button",{name:"Pesca"})),await r(o).toHaveBeenCalled()}};var a,t,n;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`{
  play: async ({
    canvas
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Pesca"
    }));
    await expect(onChoose).toHaveBeenCalled();
  }
}`,...(n=(t=e.parameters)==null?void 0:t.docs)==null?void 0:n.source}}};const P=["Default"];export{e as Default,P as __namedExportsOrder,_ as default};
