import { Request, Response, NextFunction } from "express";
import { Product } from "../models/productModel";
import { catchAsync } from "../utils/catchAsync";
import multer, { Multer } from "multer";
import { AppError } from "../utils/appError";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { ProductImage } from "../@types";
import { deleteFiles } from "../utils/helper";

export const getProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Filtering Logic
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. Advanced Filtering (gte, gt, etc.)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const filtersObj = JSON.parse(queryStr);

    // 3. IMPROVEMENT: Make string filters case-insensitive (Regex)
    // This allows searching 'bosch' to find 'Bosch'
    Object.keys(filtersObj).forEach((key) => {
      if (typeof filtersObj[key] === "string") {
        filtersObj[key] = { $regex: filtersObj[key], $options: "i" };
      }
    });

    let query = Product.find(filtersObj);

    // 4. Sorting
    if (req.query.sort && typeof req.query.sort === "string") {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 5. Field Limiting
    if (req.query.fields && typeof req.query.fields === "string") {
      const selectFields = req.query.fields.split(",").join(" ");
      query = query.select(selectFields);
    } else {
      query = query.select("-__v");
    }

    // 6. Pagination
    const pageNum = parseInt(req.query.page as string, 10) || 1;
    const limitNum = parseInt(req.query.limit as string, 10) || 100; // Default to 100 for better performance
    const skip = (pageNum - 1) * limitNum;

    query = query.skip(skip).limit(limitNum);

    // 7. Execution & Meta Data
    const products = await query;
    const totalCount = await Product.countDocuments(filtersObj);
    const totalPages = Math.ceil(totalCount / limitNum);

    // After you calculate totalPages
    if (pageNum > totalPages && totalCount > 0) {
      return next(new AppError("This page does not exist", 404));
    }
    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
        pagination: {
          totalCount,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
        },
      },
    });
  },
);
// !---------- If we are not processing the image before uploading it we would store the image in the memeory instead of the storage but here we are not procesing it thus we are storing it on desk
// // 1. Define where and how to store the files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/uploads/products'); // The folder we just created
//   },
//   filename: (req, file, cb) => {
//     // Result: product-clientID-timestamp.jpg
//     const ext = path.extname(file.originalname);
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, `product-${uniqueSuffix}${ext}`);
//   }
// });

// // 2. Filter: Only allow images
// const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images.', 400), false);
//   }
// };

// export const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
// });

// !---------- If we are not processing the image before uploading it we would store the image in the memeory instead of the storage but here we are not procesing it thus we are storing it on desk

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Check for "image/" (e.g., image/png, image/jpeg)

  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/octet-stream"
  ) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB safety limit
  // dest: "uploads/products", // This is where multer will temporarily store the uploaded files
});

// Matches the field name 'productImages' from your frontend
export const uploadProductImages = upload.array("productImages", 30);

export const convertProductImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Better check for files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return next();

    req.body.productImages = [];

    // 2. Process images
    await Promise.all(
      files.map(async (file, i) => {
        const imageName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;

        await sharp(file.buffer)
          // .resize(800, 800) // Recommended to keep your garage catalog looking uniform
          .toFormat("jpeg")
          // .jpeg({ quality: 90 })
          .toFile(`public/uploads/products/${imageName}`);

        // 3. Robust isMain logic
        // It's main if: it matches the name OR if it's the first image and no name was provided
        let isMain = file.originalname === req.body.mainImageName;

        req.body.productImages.push({
          imageUrl: `/uploads/products/${imageName}`,
          filename: file.originalname,
          isMain: isMain,
        });
      }),
    );

    next();
  },
);
export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const createdProduct = await Product.create(req.body);
    console.log(createdProduct, "PRODUCT CREATED");
    res.status(201).json({
      status: "success",
      data: {
        product: createdProduct,
      },
    });
  },
);

export const getProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError("No product found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  },
);

export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // 1) Get the current product
    const productBeingUpdated = await Product.findById(id);
    if (!productBeingUpdated) {
      return next(new AppError(`No product found with ID: ${id}`, 404));
    }

    // 2) Handle imagesToDelete (Safe Parse)
    let imagesToDelete: string[] = [];
    if (typeof req.body.imagesToDelete === "string") {
      imagesToDelete = JSON.parse(req.body.imagesToDelete);
    } else if (Array.isArray(req.body.imagesToDelete)) {
      imagesToDelete = req.body.imagesToDelete;
    }

    // 3) Calculate the merged image array
    const newImages = (req.body.productImages as ProductImage[]) || [];

    const remainingImages = (productBeingUpdated.productImages || []).filter(
      (img) => !imagesToDelete.includes(img.imageUrl),
    );

    // Overwrite the body with the final merged list
    req.body.productImages = [...remainingImages, ...newImages];

    // 4) Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // 5) FAILSAFE: If update fails, only delete the NEWLY uploaded files
    if (!updatedProduct) {
      deleteFiles(newImages.map((m) => m.imageUrl));
      // newImages.forEach((img: ProductImage) => {
      //   const filePath = path.join(__dirname, "../../public", img.imageUrl);
      //   fs.unlink(filePath, () => {});
      // });
      return next(new AppError("No product found with that ID", 404));
    }

    // 6) SUCCESS: Now delete the files the user specifically marked for removal
    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete);
      // imagesToDelete.forEach((imgUrl) => {
      //   const filePath = path.join(__dirname, "../../public", imgUrl);
      //   fs.unlink(filePath, (err) => {
      //     if (err) console.error(`Could not delete file: ${filePath}`);
      //   });
      // });
    }

    res.status(200).json({
      status: "success",
      data: { product: updatedProduct },
    });
  },
);

export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) return next(new AppError(`Failed to find Id ${id}`, 404));

    if (product.productImages?.length) {
      const imagesToDelete = product.productImages?.map((img) => img.imageUrl);
      deleteFiles(imagesToDelete);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export const deleteMultipleProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body; // Expecting ['id1', 'id2', ...]

    // 1. Find all products to get their image paths before they are gone
    const productsToDelete = await Product.find({
      _id: { $in: ids },
    });

    if (!productsToDelete.length) {
      return next(new AppError("No products found with those IDs", 404));
    }

    // 2. Extract all image URLs safely
    // .flatMap handles the nested arrays, .map grabs the specific string
    const allImgs = productsToDelete.flatMap((product) =>
      product.productImages.map((img) => img.imageUrl),
    );

    // 3. Delete physical files
    if (allImgs.length > 0) {
      deleteFiles(allImgs);
    }

    // 4. Delete from Database
    await Product.deleteMany({ _id: { $in: ids } });

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
