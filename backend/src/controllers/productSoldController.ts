import { NextFunction, Request, Response } from "express";
import { ProductSold } from "../models/productSoldModel";
import { catchAsync } from "../utils/catchAsync";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Product } from "../models/productModel";
import { updateServiceTotals } from "./serviceController";
import { updateProductsStock } from "./productController";
import StockLogs from "../models/stockLogsModel";

export const getAllProductSold = getAll(ProductSold);

export const getProductSold = getOne(ProductSold, {
  path: "product",
  select: "stock name productImages listPrice salePrice",
});
export const createProductSold = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body, "REASDASDA");
    const user = req.user;
    if (!user)
      return next(
        new AppError(
          `Unauthorized action, Please make sure you are logged in`,
          401,
        ),
      );
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const dbProduct = await Product.findById(req.body.product).session(
        session,
      );
      if (!dbProduct)
        return next(
          new AppError(`Failed to find product:${req.body.product}`, 404),
        );

      if (req.body.count > dbProduct.stock)
        return next(
          new AppError(
            `Insuffectiont stock, there is only ${dbProduct.stock} in the store`,
            400,
          ),
        );
      req.body.originalPricePerUnit = dbProduct.listPrice;
      req.body.originalDiscountPerUnit = dbProduct.salePrice
        ? dbProduct.listPrice - dbProduct.salePrice
        : 0;

      const saleCount = req.body.count;
      const totalPrice = req.body.pricePerUnit * saleCount;
      const totalDiscount = req.body.discountPerUnit * saleCount;

      const totalPriceAfterDiscount = totalPrice - totalDiscount;

      const createdProductSold = await ProductSold.create(
        [{ ...req.body, totalPriceAfterDiscount }],
        { session },
      );

      console.log(createProductSold, "CREATED PRODUCT");
      await StockLogs.create(
        [
          {
            product: dbProduct._id,
            referenceId: req.body.service,
            change: -saleCount,
            previousStock: dbProduct.stock,
            currentStock: dbProduct.stock - saleCount,
            reason: "retail-sale",
            user: user._id,
          },
        ],
        { ordered: true, session },
      );

      await updateProductsStock(
        [
          {
            id: dbProduct._id.toString(),
            change: -saleCount,
            currentStock: dbProduct.stock,
          },
        ],
        session,
      );

      await updateServiceTotals({
        serviceId: req.body.service,
        price: totalPrice,
        discount: totalDiscount,
        session,
      });

      await session.commitTransaction();
      res.status(200).json({
        message: "success",
        data: createdProductSold,
      });
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);

export const updateProductSold = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const body = req.body;
    const user = req.user;

    if (!user) return next(new AppError("Unauthorized action", 401));
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Find the sold product entry
      const productSold = await ProductSold.findById(id).session(session);
      if (!productSold)
        return next(
          new AppError(`No product sold entry found with ID: ${id}`, 404),
        );

      // 2. Get retlated product for setting the original price and discount in case the user inputs different price marks
      const relatedProduct = await Product.findById(
        productSold.product,
      ).session(session);
      if (!relatedProduct)
        return next(
          new AppError(
            `Failed to get the related product to the sold product entry of the ID: ${productSold.id}`,
            404,
          ),
        );

      // 3. Establish clean Fallbacks for incoming request body values
      const finalIsReturned =
        typeof body.isReturned === "boolean"
          ? body.isReturned
          : productSold.isReturned;

      const finalPricePer =
        typeof body.pricePerUnit === "number"
          ? body.pricePerUnit
          : productSold.pricePerUnit;
      const finalDiscountPer =
        typeof body.discountPerUnit === "number"
          ? body.discountPerUnit
          : productSold.discountPerUnit;
      const finalCount =
        typeof body.count === "number" ? body.count : productSold.count;

      // 4. Calculate Financial Deltas (Formula: NEW - OLD)
      const oldTotalPrice = productSold.isReturned
        ? 0
        : productSold.pricePerUnit * productSold.count;
      const oldTotalDiscount = productSold.isReturned
        ? 0
        : productSold.discountPerUnit * productSold.count;

      const newTotalPrice = finalIsReturned ? 0 : finalPricePer * finalCount;
      const newTotalDiscount = finalIsReturned
        ? 0
        : finalDiscountPer * finalCount;

      const deltaPrice = newTotalPrice - oldTotalPrice;
      const deltaDiscount = newTotalDiscount - oldTotalDiscount;

      // 5. Calculate Physical Stock Inventory Delta
      // An active sale REDUCES stock, a return RESTORES stock.
      const oldStockImpact = productSold.isReturned ? 0 : productSold.count;
      const newStockImpact = finalIsReturned ? 0 : finalCount;

      // If newStockImpact is higher (e.g. buying 5 instead of 2), stockChange is negative (deduct from shelf)
      const stockChange = oldStockImpact - newStockImpact;

      // 6. Update the related product stocks according to the updated stock, and create stock logs wit the updates
      if (stockChange !== 0) {
        await updateProductsStock(
          [
            {
              id: relatedProduct._id.toString(),
              change: stockChange,
              currentStock: relatedProduct.stock,
            },
          ],
          session,
        );

        await StockLogs.create(
          [
            {
              product: relatedProduct._id,
              referenceId: productSold.service,
              change: stockChange,
              previousStock: relatedProduct.stock,
              currentStock: relatedProduct.stock + stockChange,
              reason:
                finalIsReturned && !productSold.isReturned
                  ? "return"
                  : "sale-quantity-updated",
              user: user._id,
            },
          ],
          { session },
        );
      }

      // 7. Update the detials of the product sold entry
      //! You need to make sure that the user can't set the price per unit below the original price on the front-end
      const updatedPrdouctSold = await ProductSold.findByIdAndUpdate(
        id,
        {
          ...body,
          totalPriceAfterDiscount:
            (finalPricePer - finalDiscountPer) * finalCount,
        },
        {
          new: true,
          runValidators: true,
        },
      ).session(session);

      if (!updatedPrdouctSold)
        return next(
          new AppError(
            `Failed to update product sold entry ID:${productSold._id}`,
            500,
          ),
        );
      // 8. Update the parent service totals
      if (deltaPrice !== 0 || deltaDiscount !== 0) {
        console.log(deltaPrice, "DELTA PRICE");
        await updateServiceTotals({
          serviceId: productSold.service.toString(),
          price: deltaPrice,
          discount: deltaDiscount,
          session,
        });
      }

      await session.commitTransaction();
      res.status(200).json({
        status: "success",
        data: updatedPrdouctSold,
      });
    } catch (err: any) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);

export const deleteProductSold = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user;

    const shouldRestock = req.body.shouldRestock === true;
    if (!user) {
      return next(
        new AppError("Unauthorized action, you are not logged in", 401),
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch the targeted sale record line document
      const productSold = await ProductSold.findById(id).session(session);
      if (!productSold) {
        return next(
          new AppError(`No product sold entry found with ID: ${id}`, 404),
        ); // Fixed 404 & AppError syntax
      }

      // 2. Fetch the inventory master record
      const relatedProduct = await Product.findById(
        productSold.product,
      ).session(session);
      if (!relatedProduct) {
        return next(
          new AppError(`Master product profile not found for this entry`, 404),
        );
      }

      // 3. CRUCIAL FIX: Only perform a physical restock if requested AND it wasn't already returned!
      if (shouldRestock && !productSold.isReturned) {
        await updateProductsStock(
          [
            {
              id: relatedProduct._id.toString(),
              change: productSold.count,
              currentStock: relatedProduct.stock,
            },
          ],
          session,
        );

        await StockLogs.create(
          [
            {
              referenceId: productSold.service, // Use parent service ID for a clean history lookup
              product: relatedProduct._id,
              change: productSold.count,
              previousStock: relatedProduct.stock,
              currentStock: relatedProduct.stock + productSold.count,
              reason: "product-sold-deleted",
              user: user._id, // Keep a tracking trail of who deleted this row item
            },
          ],
          { session },
        );
      }

      // 5. Safely purge document record inside session thread
      await ProductSold.deleteOne({ _id: id }).session(session);

      // 4. Update the Parent Invoice Totals ONLY if the item was contributing financially
      if (!productSold.isReturned) {
        await updateServiceTotals({
          serviceId: productSold.service.toString(),
          price: -(productSold.pricePerUnit * productSold.count),
          discount: -(productSold.discountPerUnit * productSold.count),
          session,
        });
      }

      await session.commitTransaction();

      // 204 No Content is standard for successful deletions (or use 200 if returning data)
      res.status(204).end();
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);
