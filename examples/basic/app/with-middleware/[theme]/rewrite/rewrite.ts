import type { RewriteHandler } from "@cxnpl/next-app-middleware/runtime";

const rewrite: RewriteHandler<{ theme: string }> = ({ params: { theme } }) => {
  return "/" + theme;
};

export default rewrite;
