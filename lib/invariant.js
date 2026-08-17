// src/invariant.ts
var PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-annotator";
var name = "client-ui-annotator-invariant";
var inject = ["invariants"];
var install = () => {
};
var apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
export {
  apply,
  inject,
  name
};
//# sourceMappingURL=invariant.js.map
