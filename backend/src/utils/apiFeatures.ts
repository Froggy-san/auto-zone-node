class APIFeatures {
  public queryString;
  public query;
  public filtersObj;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;

    // 1. Shallow copy the query and strip out administrative terms
    const queryObj = { ...queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. Automatically map non-prefixed operators (e.g., gte -> $gte, or -> $or, regex -> $regex)
    // This allows both explicit frontend contracts ($or) and flat inputs to parse flawlessly
    let queryStr = JSON.stringify(queryObj);
    // The (?<!\$) means: Match these words ONLY if they are NOT preceded by a $
    queryStr = queryStr.replace(
      /(?<!\b)\b(gte|gt|lte|lt|or|in|regex|options)\b/g,
      (match) => `$${match}`,
    );
    this.filtersObj = JSON.parse(queryStr);
    console.log(this.filtersObj, "FILTER OBj");
  }
  filter() {
    this.query = this.query.find(this.filtersObj);
    return this;
  }

  sort() {
    const sort = this.queryString.sort;
    if (sort && typeof sort === "string") {
      const sortBy = sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    const fields = this.queryString.fields;
    if (fields && typeof fields === "string") {
      const fieldsStr = fields.split(",").join(" ");
      this.query = this.query.select(fieldsStr);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page
      ? parseInt(this.queryString.page as string)
      : 1;
    const limit = this.queryString.limit
      ? parseInt(this.queryString.limit as string)
      : 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
export default APIFeatures;

// !important - Before 'qs' library:  This file is the main utility for processing API query parameters  for filtering, sorting, field limiting, and pagination. It defines the APIFeatures class which takes a Mongoose query and the request query string, processes the filters, and applies them to the query. The class methods allow chaining for easy use in controllers. The helper function processReqQuery is used to convert the query string into a MongoDB filter object while excluding certain fields from regex processing.

// import { processReqQuery } from "./helper";
// const EXCLUDED_REX_FIELDS = [
//   "category",
//   "productType",
//   "productBrand",
//   "carMaker",
//   "carModel",
//   "_id",
//   "plateNumber",
//   "motorNumber",
//   "chassisNumber",
//   "odometer",
// ];

// class APIFeatures {
//   public queryString;
//   public query;
//   public filtersObj;
//   constructor(query: any, queryString: any) {
//     this.query = query;
//     this.queryString = queryString;

//     //! the fieldsToPreventRegex are the fields you want the function to avoid putting the regex filter on like the (_id,category,ext).
//     this.filtersObj = processReqQuery({
//       query: queryString,
//       excludedFields: ["page", "sort", "limit", "fields"],
//       fieldsToPreventRegex: EXCLUDED_REX_FIELDS,
//     });

//     // const queryObj = { ...queryString };

//     // const excludedFields = ["page", "sort", "limit", "fields"];
//     // excludedFields.forEach((el) => delete queryObj[el]);

//     // // 2. Advanced Filtering (gte, gt, etc.)
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     // this.filtersObj = JSON.parse(queryStr);
//     // // 3. IMPROVEMENT: Make string filters case-insensitive (Regex)
//     // // This allows searching 'bosch' to find 'Bosch'
//     // Object.keys(this.filtersObj).forEach((key) => {
//     //   const value = this.filtersObj[key];

//     //   // 1. Define keys that should NEVER use regex (your MongoDB IDs)
//     //   const exactMatchKeys = [
//     //     "category",
//     //     "productType",
//     //     "productBrand",
//     //     "carMaker",
//     //     "carModel",
//     //     "_id",
//     //   ];

//     //   if (
//     //     typeof value === "string" &&
//     //     !exactMatchKeys.includes(key) && // Skip IDs
//     //     value !== "true" &&
//     //     value !== "false"
//     //   ) {
//     //     this.filtersObj[key] = { $regex: value, $options: "i" };
//     //   }
//     // });
//   }
//   filter() {
//     this.query = this.query.find(this.filtersObj);
//     return this;
//   }

//   sort() {
//     const sort = this.queryString.sort;
//     if (sort && typeof sort === "string") {
//       const sortBy = sort.split(",").join(" ");
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort("-createdAt");
//     }
//     return this;
//   }

//   limitFields() {
//     const fields = this.queryString.fields;
//     if (fields && typeof fields === "string") {
//       const fieldsStr = fields.split(",").join(" ");
//       this.query = this.query.select(fieldsStr);
//     } else {
//       this.query = this.query.select("-__v");
//     }
//     return this;
//   }

//   paginate() {
//     const page = this.queryString.page
//       ? parseInt(this.queryString.page as string)
//       : 1;
//     const limit = this.queryString.limit
//       ? parseInt(this.queryString.limit as string)
//       : 100;
//     const skip = (page - 1) * limit;
//     this.query = this.query.skip(skip).limit(limit);
//     return this;
//   }
// }
// export default APIFeatures;
