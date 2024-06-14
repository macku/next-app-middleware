import type { RedirectHandler } from "@cxnpl/next-app-middleware/runtime";

const redirect: RedirectHandler<{ theme: string }> = () => {
  return "/";
};

export default redirect;
