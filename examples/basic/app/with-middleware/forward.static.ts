import { StaticForwarder } from "@cxnpl/next-app-middleware/runtime";

export const hosted: StaticForwarder = () => {
  return true;
};
