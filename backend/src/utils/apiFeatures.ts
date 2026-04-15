// class APIfeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     const { page, limit, sort, fields, ...rest } = this.queryString;
//     let queryStr = JSON.stringify(rest);

//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     const filters = JSON.parse(queryStr);

//     this.query = this.query.find(filters);
//     return this;
//   }

//   sort() {
//     if (this.queryString.sort) {
//       const sortby = this.queryString.sort.split(',').join(' ');
//       this.query = this.query.sort(sortby);
//     } else {
//       this.query = this.query.sort('-createdAt');
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fieldsQuery = this.queryString.fields.split(',').join(' ');
//       this.query = this.query.select(fieldsQuery);
//     } else {
//       this.query = this.query.select('-__v');
//     }
//     return this;
//   }

//   paginate() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);
//     return this;
//   }
// }

// module.exports = APIfeatures;
