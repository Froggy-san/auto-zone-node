import { Request } from "express";
import fs from "fs/promises";
import path from "path";
export function normalizeReqQuery(req: Request) {
  const normalizedQuery: any = {};
  Object.keys(req.query).forEach((key) => {
    // Turn "ListPrice" into "listPrice"
    normalizedQuery[key.toLowerCase()] = req.query[key];
  });
  return normalizedQuery;
}

export const deleteFiles = async (filePaths: string[]): Promise<void> => {
  // Use Promise.all to run all deletions in parallel!
  await Promise.all(
    filePaths.map(async (file) => {
      const filePath = path.join(__dirname, "../../public", file);

      try {
        // Just try to delete it directly
        await fs.unlink(filePath);
      } catch (err: any) {
        // ENOENT means "File not found" - we can ignore that
        if (err.code !== "ENOENT") {
          console.error(`[FileHelper] Error deleting ${file}:`, err);
        }
      }
    }),
  );
};

/**
 * Deletes multiple files from the public folder
 * @param filePaths Array of relative paths (e.g., ['/uploads/img.jpg'])
 */
// export const deleteFiles = (filePaths: string[]) => {
//   filePaths.forEach((file) => {
//     // Ensure we are pointing to the correct public directory
//     const filePath = path.join(__dirname, "../../public", file);

//     if (fs.existsSync(filePath)) {
//       fs.unlink(filePath, (err) => {
//         if (err) console.error(`[FileHelper] Error deleting ${file}:`, err);
//       });
//     }
//   });
// };

export function processReqQuery({
  query,
  excludedFields = [],
  fieldsToPreventRegex = [],
}: {
  query: Record<string, any>;
  excludedFields?: string[];
  fieldsToPreventRegex?: string[];
}) {
  const queryObj = { ...query };

  // 1. Clear out pagination/sort fields
  if (excludedFields.length) {
    excludedFields.forEach((el) => delete queryObj[el]);
  }

  // 2. Handle numeric comparisons ($gte, $lt, etc.)
  let queryStr = JSON.stringify(queryObj);

  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in|ne)\b/g,
    (match) => `$${match}`,
  );
  const filtersObj = JSON.parse(queryStr);

  // 3. Helper to identify MongoDB IDs
  const isObjectId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);

  // 4. Apply Regex ONLY to non-ID strings
  Object.keys(filtersObj).forEach((key) => {
    const value = filtersObj[key];

    if (typeof value === "string") {
      // Logic: Is it an ID? Is it a boolean string? Is it explicitly blocked?
      const isID = isObjectId(value);
      const isBlocked = fieldsToPreventRegex.includes(key);
      const isBool = value === "true" || value === "false";

      if (!isID && !isBlocked && !isBool) {
        filtersObj[key] = { $regex: value, $options: "i" };
      }
    }
  });

  return filtersObj;
}

// export function processReqQuery({
//   query,
//   excludedFields = [],
//   fieldsToPreventRegex = [],
// }: {
//   query: Record<string, any>; // Correct type
//   excludedFields?: string[];
//   fieldsToPreventRegex?: string[];
// }) {
//   // 1. Create a shallow copy to avoid mutating the original req.query
//   const queryObj = { ...query };

//   // 2. Remove excluded fields (page, sort, limit, etc.)
//   if (excludedFields.length) {
//     excludedFields.forEach((el) => delete queryObj[el]);
//   }

//   // 3. Advanced Filtering (gte, gt, etc.)
//   let queryStr = JSON.stringify(queryObj);
//   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//   const filtersObj = JSON.parse(queryStr);

//   console.log(filtersObj, "FILTER OBj");
//   // 4. Case-insensitive Regex for specific strings
//   Object.keys(filtersObj).forEach((key) => {
//     const value = filtersObj[key];

//     if (
//       typeof value === "string" &&
//       !fieldsToPreventRegex.includes(key) &&
//       value !== "true" &&
//       value !== "false"
//     ) {
//       filtersObj[key] = { $regex: value, $options: "i" };
//     }
//   });

//   return filtersObj;
// }
