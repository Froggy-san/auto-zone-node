import { Request, Response, NextFunction } from "express";
import { Product } from "../models/productModel";
import { catchAsync } from "../utils/catchAsync";
import multer, { Multer } from "multer";
import { AppError } from "../utils/appError";
import sharp from "sharp";
import is from "zod/v4/locales/is.js";

export const getProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productsQuery = await Product.find();
    res.status(200).json({
      status: "success",
      data: { data: productsQuery },
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
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  // dest: "uploads/products", // This is where multer will temporarily store the uploaded files
});

// Matches the field name 'productImages' from your frontend
export const uploadProductImages = upload.array("productImages", 30);

export const convertProductImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Better check for files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return next();

    req.body.images = [];

    // 2. Process images
    await Promise.all(
      files.map(async (file, i) => {
        const imageName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;

        await sharp(file.buffer)
          .resize(800, 800) // Recommended to keep your garage catalog looking uniform
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/uploads/products/${imageName}`);

        // 3. Robust isMain logic
        // It's main if: it matches the name OR if it's the first image and no name was provided
        let isMain = file.originalname === req.body.mainImageName;

        // Fallback: If no mainImageName was sent, make the first image the main one
        if (!req.body.mainImageName && i === 0) {
          isMain = true;
        }

        req.body.images.push({
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
