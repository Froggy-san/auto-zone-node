import { Request } from "express";
import fs from "fs";
import path from "path";
export function normalizeReqQuery(req: Request) {
  const normalizedQuery: any = {};
  Object.keys(req.query).forEach((key) => {
    // Turn "ListPrice" into "listPrice"
    normalizedQuery[key.toLowerCase()] = req.query[key];
  });
  return normalizedQuery;
}

/**
 * Deletes multiple files from the public folder
 * @param filePaths Array of relative paths (e.g., ['/uploads/img.jpg'])
 */
export const deleteFiles = (filePaths: string[]) => {
  filePaths.forEach((file) => {
    // Ensure we are pointing to the correct public directory
    const filePath = path.join(__dirname, "../../public", file);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`[FileHelper] Error deleting ${file}:`, err);
      });
    }
  });
};
