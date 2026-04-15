import { Request } from "express";

export function normalizeReqQuery(req: Request) {
  const normalizedQuery: any = {};
  Object.keys(req.query).forEach((key) => {
    // Turn "ListPrice" into "listPrice"
    normalizedQuery[key.toLowerCase()] = req.query[key];
  });
  return normalizedQuery;
}
