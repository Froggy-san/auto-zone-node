import { NextFunction, Request, Response } from "express";
import {
  FulfillmentStatus,
  IInvoiceItem,
  SupplierInvoice,
} from "../models/supplierInvoiceModel";
import { catchAsync } from "../utils/catchAsync";
import { getAll, getOne } from "../utils/controllerFactory";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Product } from "../models/productModel";
import { determinePaymentStatus } from "./serviceController";
import StockLogs, { IStockLog } from "../models/stockLogsModel";
import {
  updateAndLogProductStocks,
  updateProductsStock,
  UpdateStock,
} from "./productController";
import {
  AddSupplierInvoiceItemInput,
  CreateSupplierInvoiceInput,
  UpdateSupplierInvoiceInput,
  UpdateSupplierInvoiceItemInput,
} from "../validators/supplierInvoiceValidator";

type AddItemProps = AddSupplierInvoiceItemInput & {
  netLineTotal: number;
};
export function determineSupplierInvoiceFulfillmentStatus(
  items: AddSupplierInvoiceItemInput[],
) {
  // Implementation for determining fulfillment status
  const totalOrdered = items.reduce((acc, i) => acc + i.orderedQuantity, 0);
  const totalReceived = items.reduce((acc, i) => acc + i.receivedQuantity, 0);

  if (totalReceived === 0) {
    return "pending";
  }
  if (totalReceived >= totalOrdered) {
    return "received";
  }
  return "partially-received";
}

export const getAllSupplierInvoices = getAll(SupplierInvoice, {
  path: "items.product",
});

export const getSupplierInvoice = getOne(SupplierInvoice, {
  path: "items.product",
});

export const createSupplierInvoice = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body: CreateSupplierInvoiceInput = req.body;

    console.log("CREATE SUPPLIER INVOICE BODY:", body);
    const user = req.user;
    if (!user) {
      return next(
        new AppError(
          "Unauthorized action, Please make sure you are logged in",
          401,
        ),
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Structural Checks and Validations
      const productsId: string[] = body.items.map((i: any) =>
        i.product.toString(),
      );

      const uniqueProIds = Array.from(new Set(productsId));

      const dbProducts = await Product.find({
        _id: { $in: uniqueProIds },
      }).session(session);

      if (dbProducts.length !== uniqueProIds.length) {
        throw new AppError(
          "One or more selected products do not exist in your master catalog",
          404,
        );
      }

      const productsMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

      // 2. Initialize Accrual Metrics
      let subTotal = 0;
      let totalTax = 0;
      let totalDiscount = 0;
      let grandTotal = 0;

      const productsStockUpdates: any[] = [];
      const logs: any[] = [];
      const items: AddItemProps[] = [];

      const totalNumberOfItems = body.items.reduce(
        (acc, curr) => (acc += curr.orderedQuantity || 0),
        0,
      );

      const shippingCostPerUnit =
        totalNumberOfItems > 0 ? body.shippingAndFees / totalNumberOfItems : 0;

      // 3. Process Financial and Stock Transformations Loop
      body.items.forEach((item) => {
        const dbProduct = productsMap.get(item.product.toString());
        if (!dbProduct)
          throw new AppError("Product sync error during loop computation", 404);
        const lineOrderedQty = Number(item.orderedQuantity) || 0;
        const lineReceivedQty = Number(item.receivedQuantity) || 0;
        if (lineOrderedQty <= 0)
          throw new AppError("Invalid item quantity", 400);
        // Total cost for this line item row before any discounts/taxes

        const lineCostPerUnit = item.costPriceBeforeTax;
        const lineDiscPerUnit =
          (lineCostPerUnit * (item.discountPercentage || 0)) / 100;
        const lineTaxPerUnit =
          ((lineCostPerUnit - lineDiscPerUnit) *
            (item.taxRatePercentage || 0)) /
          100;

        const totalLineGrossPrice = lineCostPerUnit * lineOrderedQty;

        const totalLineDiscountAmount = lineDiscPerUnit * lineOrderedQty;

        // Calculated line tax amount using correct adjusted baseline
        const totalLineTaxAmount = lineTaxPerUnit * lineOrderedQty;
        // Calculate the absolute isolated net total for just this single line item
        const totalLineShippingAndFees = lineOrderedQty * shippingCostPerUnit;
        const absoluteNetLineTotal =
          totalLineGrossPrice -
          totalLineDiscountAmount +
          totalLineTaxAmount +
          totalLineShippingAndFees;

        //  Calculate the netLineTotal for each item and push it to the items to be saved in the invoice
        items.push({
          ...item,
          product: dbProduct._id.toString(),
          netLineTotal: Number(absoluteNetLineTotal.toFixed(2)),
        });

        // Increment Global Aggregations
        subTotal += totalLineGrossPrice;
        totalDiscount += totalLineDiscountAmount;
        totalTax += totalLineTaxAmount;
        grandTotal += absoluteNetLineTotal;

        // 4. Calculate Inventory Costs (Only pool values for stock that is actually received)
        const totalLineGrossPriceRec = lineCostPerUnit * lineReceivedQty;
        const totalLineDiscountAmountRec = lineDiscPerUnit * lineReceivedQty;
        const totalLineTaxAmountRec = lineTaxPerUnit * lineReceivedQty;
        const totalLineShippingRec = lineReceivedQty * shippingCostPerUnit;

        const absoluteNetLineTotalRec =
          totalLineGrossPriceRec -
          totalLineDiscountAmountRec +
          totalLineTaxAmountRec +
          totalLineShippingRec;

        // Fixed Math: Deduced target item's landed unit price accurately
        // const exactUnitLandedCost = absoluteNetLineTotal / item.quantity;

        // Determine the new WAC = 'weighted average cost'
        const currentTotalStock = dbProduct.stock + lineReceivedQty;
        const wac =
          currentTotalStock > 0
            ? (dbProduct.weightedAverageCost * dbProduct.stock +
                absoluteNetLineTotalRec) /
              currentTotalStock
            : dbProduct.weightedAverageCost;
        // Formulate Bulk Write Payload
        const updatePayload: Record<string, any> = {
          $inc: { stock: lineReceivedQty },
          $set: {
            weightedAverageCost: Number(wac.toFixed(2)), // Fixed typo from lastConstPrice

            isAvailable: currentTotalStock > 0,
          },
        };

        // Pricing Configuration Handler
        if (item.newRetailPrice) {
          updatePayload.$set.listPrice = item.newRetailPrice;
        }
        if (item.newSalePrice) {
          updatePayload.$set.salePrice = item.newSalePrice;
        }

        // Stage Ledger Entries
        if (lineReceivedQty > 0) {
          productsStockUpdates.push({
            updateOne: {
              filter: { _id: dbProduct._id },
              update: updatePayload,
            },
          });
          logs.push({
            product: dbProduct._id,
            change: lineReceivedQty,
            previousStock: dbProduct.stock,
            currentStock: currentTotalStock,
            reason: "restock",
            user: user._id,
          });
        }
      });

      const paymentStatus = determinePaymentStatus(
        grandTotal,
        body.amountPaid || 0,
      );

      const fulfillmentStatus =
        determineSupplierInvoiceFulfillmentStatus(items);
      // 4. Save Invoice to Database
      const [createdInvoice] = await SupplierInvoice.create(
        [
          {
            ...body,
            items,
            subTotal: Number(subTotal.toFixed(2)),
            totalTax: Number(totalTax.toFixed(2)),
            totalDiscount: Number(totalDiscount.toFixed(2)),
            grandTotal: Number(grandTotal.toFixed(2)),
            paymentStatus,
            createdBy: user._id,
            fulfillmentStatus,
            fulfilledAt:
              fulfillmentStatus === "received" ? new Date() : undefined,
          },
        ],
        { session },
      );

      const totalReceivedQty = items.reduce(
        (acc, i) => (acc += i.receivedQuantity),
        0,
      );
      if (!createdInvoice)
        throw new AppError("Failed to create supplier invoice record", 400);

      // 6. Write to Catalog and History Log only if physical goods were processed
      if (productsStockUpdates.length > 0) {
        await Product.bulkWrite(productsStockUpdates, {
          session,
          ordered: true,
        });

        const finalizedLogs = logs.map((log) => ({
          ...log,
          referenceId: createdInvoice._id,
        }));
        await StockLogs.create(finalizedLogs, { session });
      }

      await session.commitTransaction();
      res.status(200).json({ status: "success", data: createdInvoice });
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  },
);

export const updateSupplierInvoice = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body: UpdateSupplierInvoiceInput = req.body;
    const { id } = req.params;
    const user = req.user;

    if (!id) return next(new AppError("Invalid id", 400));
    if (!user) {
      return next(
        new AppError(
          "Unauthorized action, Please make sure you are logged in",
          401,
        ),
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const supplierInvoice =
        await SupplierInvoice.findById(id).session(session);
      if (!supplierInvoice) {
        throw new AppError(
          `Failed to find supplier invoice with the ID: ${id}`,
          404,
        );
      }

      const itemsIds = supplierInvoice.items.map((i) => i.product.toString());
      const dbProducts = await Product.find({ _id: { $in: itemsIds } }).session(
        session,
      );

      if (dbProducts.length !== new Set(itemsIds).size) {
        throw new AppError("One or more products are not found", 404);
      }
      const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

      // Core State Transitions
      const currentFulfillmentStatus = supplierInvoice.fulfillmentStatus;
      const targetFulfillmentStatus =
        body.fulfillmentStatus || supplierInvoice.fulfillmentStatus;

      const isAlreadyReturnedOrCanceledOrPending = [
        "returned",
        "canceled",
        "pending",
      ].includes(currentFulfillmentStatus);
      const isEnteringReturnedOrCanceledOrPending = [
        "returned",
        "canceled",
        "pending",
      ].includes(targetFulfillmentStatus);
      const isStatusChanged =
        targetFulfillmentStatus !== currentFulfillmentStatus;

      // Extract raw shipping metrics
      const oldShippingAndFees = supplierInvoice.shippingAndFees || 0;
      // If entering a cancellation/return state, active shipping charges drop to 0
      const newShippingAndFees = isEnteringReturnedOrCanceledOrPending
        ? 0
        : typeof body.shippingAndFees === "number"
          ? body.shippingAndFees
          : oldShippingAndFees;

      const deltaShipping = newShippingAndFees - oldShippingAndFees;

      // Filter active items that are part of the target calculations
      const activeItems = supplierInvoice.items.filter(
        (item) => !item.isReturned,
      );
      const totalItemQuantity = activeItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      const targetShippingPerUnit =
        totalItemQuantity > 0 ? newShippingAndFees / totalItemQuantity : 0;
      const oldShippingPerUnit =
        totalItemQuantity > 0 ? oldShippingAndFees / totalItemQuantity : 0;
      const deltaShippingPerUnit = targetShippingPerUnit - oldShippingPerUnit;

      const updatePayload: Record<string, any> = { ...body };
      const productBulkOps: any[] = [];
      const stockLogs: any[] = [];

      let calcSubTotal = 0,
        calcTax = 0,
        calcDiscount = 0,
        calcGrand = 0;

      // Process every line item cleanly in a single execution loop
      const finalItems = supplierInvoice.items.map((invoiceItem) => {
        const itemCopy = invoiceItem;
        const db = productMap.get(itemCopy.product.toString());
        if (!db)
          throw new AppError(
            "Associated product database mapping missing",
            404,
          );

        const itemQty = Number(itemCopy.quantity) || 0;

        // Step 1: Manage Core Stock Corrections
        let stockChange = 0;
        let reason = "restock";

        if (isStatusChanged) {
          if (
            isAlreadyReturnedOrCanceledOrPending &&
            !isEnteringReturnedOrCanceledOrPending
          ) {
            stockChange = itemQty; // Unreturned: Re-adding items to warehouse
            itemCopy.isReturned = false;
          } else if (
            !isAlreadyReturnedOrCanceledOrPending &&
            isEnteringReturnedOrCanceledOrPending
          ) {
            stockChange = -itemQty; // Returned/Canceled: Deducting items from warehouse
            reason =
              targetFulfillmentStatus === "pending"
                ? "supplier-pending"
                : "supplier-return"; // should we add a reason for when the status is changed to pending?
            itemCopy.isReturned = ["returned", "canceled"].includes(
              targetFulfillmentStatus,
            );
          }
        }

        const newStock = db.stock + stockChange;

        // Step 2: Compute Pure Financial Line Metrics
        const lineGross = itemCopy.costPriceBeforeTax * itemQty;
        const lineDisc = (lineGross * (itemCopy.discountPercentage || 0)) / 100;
        const lineTax =
          ((lineGross - lineDisc) * (itemCopy.taxRatePercentage || 0)) / 100;

        const allocatedShipping = itemCopy.isReturned
          ? 0
          : itemQty * targetShippingPerUnit;
        itemCopy.netLineTotal = Number(
          (lineGross - lineDisc + lineTax + allocatedShipping).toFixed(2),
        );

        if (!itemCopy.isReturned) {
          calcSubTotal += lineGross;
          calcDiscount += lineDisc;
          calcTax += lineTax;
          calcGrand += itemCopy.netLineTotal;
        }

        // Step 3: Recalculate Product Weighted Average Cost (WAC)
        let finalWac = db.weightedAverageCost;

        if (stockChange > 0) {
          finalWac =
            newStock > 0
              ? (db.weightedAverageCost * db.stock + itemCopy.netLineTotal) /
                newStock
              : 0;
        } else if (stockChange < 0) {
          finalWac = newStock > 0 ? db.weightedAverageCost : 0;
        } else if (
          !isEnteringReturnedOrCanceledOrPending &&
          deltaShipping !== 0 &&
          !itemCopy.isReturned &&
          db.stock > 0
        ) {
          // Pure shipping adjustment calculation
          const totalLineShippingAdjustment = itemQty * deltaShippingPerUnit;
          finalWac =
            (db.weightedAverageCost * db.stock + totalLineShippingAdjustment) /
            db.stock;
        }

        // Safe clamping constraints
        if (finalWac < 0 || isNaN(finalWac)) finalWac = 0;

        // Step 4: Aggregate updates and history ledgers
        if (
          stockChange !== 0 ||
          (deltaShipping !== 0 && !itemCopy.isReturned)
        ) {
          productBulkOps.push({
            updateOne: {
              filter: { _id: db._id },
              update: {
                $inc: { stock: stockChange },
                $set: {
                  weightedAverageCost: Number(finalWac.toFixed(2)),
                  isAvailable: newStock > 0,
                },
              },
            },
          });
        }

        if (stockChange !== 0) {
          stockLogs.push({
            product: db._id.toString(),
            previousStock: db.stock,
            change: stockChange,
            currentStock: newStock,
            user: user._id,
            referenceId: supplierInvoice._id,
            reason,
          });
        }

        return itemCopy;
      });

      // Write changes down to DB
      if (stockLogs.length > 0) {
        await StockLogs.create(stockLogs, { ordered: true, session });
      }
      if (productBulkOps.length > 0) {
        await Product.bulkWrite(productBulkOps, { session, ordered: true });
      }

      // Update Payload Mapping Constants
      updatePayload.items = finalItems;
      updatePayload.subTotal = Number(calcSubTotal.toFixed(2));
      updatePayload.totalDiscount = Number(calcDiscount.toFixed(2));
      updatePayload.totalTax = Number(calcTax.toFixed(2));
      updatePayload.grandTotal = Number(calcGrand.toFixed(2));
      updatePayload.shippingAndFees = newShippingAndFees;

      const amountPaid =
        typeof body.amountPaid === "number"
          ? body.amountPaid
          : supplierInvoice.amountPaid;
      updatePayload.paymentStatus = determinePaymentStatus(
        updatePayload.grandTotal,
        amountPaid,
      );

      if (isStatusChanged && targetFulfillmentStatus === "received") {
        updatePayload.fulfilledAt = new Date();
      } else if (isEnteringReturnedOrCanceledOrPending) {
        updatePayload.fulfilledAt = null;
      }

      const updatedInvoice = await SupplierInvoice.findByIdAndUpdate(
        id,
        { $set: updatePayload },
        { new: true, session },
      );

      await session.commitTransaction();

      return res.status(200).json({
        status: "success",
        data: updatedInvoice,
      });
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  },
);
// export const updateSupplierInvoice = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const body: UpdateSupplierInvoiceInput = req.body;
//     const { id } = req.params;
//     const user = req.user;

//     if (!id) return next(new AppError("Invaild id", 400));
//     if (!user) {
//       return next(
//         new AppError(
//           "Unauthorized action, Please make sure you are logged in",
//           401,
//         ),
//       );
//     }

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const supplierInvoice =
//         await SupplierInvoice.findById(id).session(session);

//       if (!supplierInvoice)
//         throw new AppError(
//           `Failed to find supplier invoice with the ID: ${id}`,
//           404,
//         );

//       const itemsIds = supplierInvoice.items.map((i) => i.product.toString());
//       const dbProducts = await Product.find({ _id: { $in: itemsIds } }).session(
//         session,
//       );
//       const uniqueIds = new Set(itemsIds);

//       if (dbProducts.length !== itemsIds.length) {
//         throw new AppError("One or more products are not found", 404);
//       }
//       if (uniqueIds.size !== itemsIds.length) {
//         throw new Error("Duplicate products detected");
//       }
//       const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

//       const amountPaid = body.amountPaid || supplierInvoice.amountPaid;
//       const oldShippingAndFees = supplierInvoice.shippingAndFees || 0;
//       const newShippingAndFees = body.shippingAndFees || 0;
//       const deltaShippingAndFees = newShippingAndFees - oldShippingAndFees;
//       const totalUnitsBought = supplierInvoice.items.reduce(
//         (acc, item) => acc + item.quantity,
//         0,
//       );
//       const shippingCostPerUnit =
//         totalUnitsBought > 0 ? deltaShippingAndFees / totalUnitsBought : 0;

//       const currentFulfillmentStatus = supplierInvoice.fulfillmentStatus;
//       const targetFulfillmentStatus =
//         body.fulfillmentStatus || supplierInvoice.fulfillmentStatus;

//       const isAlreadyReturnedOrCanceled =
//         currentFulfillmentStatus === "returned" ||
//         currentFulfillmentStatus === "canceled";
//       const isEnteringReturnedOrCanceled =
//         targetFulfillmentStatus === "returned" ||
//         targetFulfillmentStatus === "canceled";

//       const isStatusChanged =
//         targetFulfillmentStatus !== currentFulfillmentStatus;

//       const isAlreadyReturnedAndEnteingUnreturned =
//         isAlreadyReturnedOrCanceled && !isEnteringReturnedOrCanceled;
//       const isAlreadyUnreturnedAndEnteringReturned =
//         !isAlreadyReturnedOrCanceled && isEnteringReturnedOrCanceled;

//       // Get all the items depending on the new fulfillment status
//       const items = supplierInvoice.items.filter(
//         (item) => item.isReturned !== isEnteringReturnedOrCanceled,
//       );

//       const totalItemQuantity = items.reduce(
//         (acc, item) => (acc += item.quantity),
//         0,
//       );
//       const shippingAndFeePerUnit =
//         totalItemQuantity > 0
//           ? supplierInvoice.shippingAndFees / totalItemQuantity
//           : 0;

//       const updatePayload: Record<string, any> = { ...body };

//       if (isStatusChanged) {
//         if (
//           isAlreadyReturnedAndEnteingUnreturned ||
//           isAlreadyUnreturnedAndEnteringReturned
//         ) {
//           let calcSubTotal = 0,
//             calcTax = 0,
//             calcDiscount = 0,
//             calcGrand = 0;

//           const updatedItems: IInvoiceItem[] = [];
//           const logs: any[] = [];

//           const updatedProducts: UpdateStock[] = [];

//           items.forEach((i) => {
//             const db = productMap.get(i.product.toString());
//             if (!db)
//               throw new AppError(
//                 "One of the bought products doesn't exist",
//                 404,
//               );
//             const itemQty = Number(i.quantity) || 0;
//             const change = isEnteringReturnedOrCanceled
//               ? -i.quantity
//               : i.quantity;
//             const currentStock = db.stock + change;

//             const reason = isEnteringReturnedOrCanceled
//               ? "supplier-return"
//               : "restock";

//             // 1. Push the new logs depending on the new fulfillment status
//             logs.push({
//               product: db._id.toString(),
//               previousStock: db.stock,
//               change,
//               currentStock,
//               user: user._id,
//               referenceId: supplierInvoice._id,
//               reason,
//             });

//             // 2. Push the new updated items
//             updatedItems.push({
//               ...i,
//               isReturned: isEnteringReturnedOrCanceled,
//             });

//             // 3. Calculate the new WAC of each prodcut depending on the new fulfillment status

//             const itemTotalCostBeforeTax = i.costPriceBeforeTax * itemQty;
//             const itemTotalDiscountAmount =
//               (itemTotalCostBeforeTax * (i.discountPercentage || 0)) / 100;
//             const itemTotalTaxAmount =
//               ((itemTotalCostBeforeTax - itemTotalDiscountAmount) *
//                 (i.taxRatePercentage || 0)) /
//               100;
//             const totalLineShippingCost = itemQty * shippingAndFeePerUnit;
//             const totalItemCost =
//               itemTotalCostBeforeTax -
//               itemTotalDiscountAmount +
//               itemTotalTaxAmount +
//               totalLineShippingCost;

//             let finalCalculatedWac = db.weightedAverageCost;
//             if (isEnteringReturnedOrCanceled) {
//               // Reversing/Subtracting inventory value
//               if (currentStock > 0) {
//                 finalCalculatedWac =
//                   (db.weightedAverageCost * db.stock - totalItemCost) /
//                   currentStock;
//               } else {
//                 finalCalculatedWac = 0; // Guard against division by zero if stock hits absolute zero
//               }
//             } else {
//               // Re-adding inventory stock value safely
//               if (currentStock > 0) {
//                 finalCalculatedWac =
//                   (db.weightedAverageCost * db.stock + totalItemCost) /
//                   currentStock;
//               }
//             }

//             // Fallback guard to handle any potential variance anomalies
//             if (finalCalculatedWac < 0 || isNaN(finalCalculatedWac)) {
//               finalCalculatedWac = 0;
//             }
//             updatedProducts.push({
//               id: i.product.toString(),
//               change: change,
//               currentStock: currentStock,
//               newWeightedAverageCost: Number(finalCalculatedWac.toFixed(2)),
//             });
//             // 4. Calculate the new matrics of the supplier invoice based on the fulfillment status
//             const lineGross = i.costPriceBeforeTax * i.quantity;
//             const lineDisc = (lineGross * i.discountPercentage) / 100;
//             const lineTax =
//               ((lineGross - lineDisc) * i.taxRatePercentage) / 100;
//             if (!isEnteringReturnedOrCanceled) {
//               calcSubTotal += lineGross;
//               calcDiscount += lineDisc;
//               calcTax += lineTax;
//               calcGrand += i.netLineTotal;
//             }
//           });

//           // Save logs
//           await StockLogs.create(logs, { ordered: true, session });

//           //  dynamic product updates against the DB
//           await updateProductsStock(updatedProducts, session);

//           // Update the invoice items while keeping their original order
//           updatePayload.items = supplierInvoice.items.map((invoiceItem) => {
//             const oneOfTheUpdatedItems = updatedItems.find(
//               (i) => i.product === invoiceItem.product,
//             );
//             return oneOfTheUpdatedItems ?? invoiceItem;
//           });
//           updatePayload.subTotal = Number(calcSubTotal.toFixed(2));
//           updatePayload.totalDiscount = Number(calcDiscount.toFixed(2));
//           updatePayload.totalTax = Number(calcTax.toFixed(2));
//           updatePayload.grandTotal = Number(calcGrand.toFixed(2));
//         }
//       }

//       // Check if the user updated the shipping and fees cost, if so we need to update the grand total of the invoice and also update the weighted average cost of each product in the invoice.

//       if (
//         deltaShippingAndFees !== 0 &&
//         shippingCostPerUnit > 0 &&
//         isEnteringReturnedOrCanceled === false
//       ) {
//         //! BTW the whole logic won't becasue if the user updated the shipping cost to be wayyyy higher than it used to be that might make the list prices of the related items unprofitable or even losing money. to make it work you have to allow the user to also update the items too along side the supplier invoice to make sure that things acutally match.
//         const productUpdates: any[] = [];
//         const updatedItems: IInvoiceItem[] = [];
//         let calcSubTotal = 0,
//           calcTax = 0,
//           calcDiscount = 0,
//           calcGrand = 0;

//         items.forEach((i) => {
//           const db = productMap.get(i.product.toString());
//           if (!db)
//             throw new AppError("One of the bought products doesn't exist", 404);

//           const itemQty = Number(i.quantity) || 0;

//           const itemTotalCostBeforeTax = i.costPriceBeforeTax * itemQty;
//           const itemTotalDiscountAmount =
//             (itemTotalCostBeforeTax * (i.discountPercentage || 0)) / 100;
//           const itemTotalTaxAmount =
//             ((itemTotalCostBeforeTax - itemTotalDiscountAmount) *
//               (i.taxRatePercentage || 0)) /
//             100;
//           const totalLineShippingCost = itemQty * shippingAndFeePerUnit;
//           const totalQty = itemQty + db.stock;
//           const totalItemCost =
//             itemTotalCostBeforeTax -
//             itemTotalDiscountAmount +
//             itemTotalTaxAmount +
//             totalLineShippingCost;

//           const previousWeightedAverageCost = db.weightedAverageCost;
//           const previousTotalStockValue =
//             previousWeightedAverageCost * db.stock;
//           const wac =
//             totalQty > 0
//               ? (previousTotalStockValue + totalItemCost) / totalQty
//               : 0;

//           const deltaWac = wac - previousWeightedAverageCost;
//           const newWeightedAverageCost = previousWeightedAverageCost + deltaWac;

//           productUpdates.push({
//             updateOne: {
//               filter: { _id: db._id },
//               update: {
//                 $set: {
//                   weightedAverageCost: Number(
//                     newWeightedAverageCost.toFixed(2),
//                   ),
//                 },
//               },
//             },
//           });

//           updatedItems.push({
//             ...i,
//             netLineTotal: totalItemCost,
//           });
//           calcSubTotal += itemTotalCostBeforeTax;
//           calcDiscount += itemTotalDiscountAmount;
//           calcTax += itemTotalTaxAmount;
//           calcGrand += i.netLineTotal;
//         });

//         updatePayload.items = supplierInvoice.items.map((invoiceItem) => {
//           const oneOfTheUpdatedItems = updatedItems.find(
//             (i) => i.product === invoiceItem.product,
//           );
//           return oneOfTheUpdatedItems ?? invoiceItem;
//         });
//         updatePayload.subTotal = Number(calcSubTotal.toFixed(2));
//         updatePayload.totalDiscount = Number(calcDiscount.toFixed(2));
//         updatePayload.totalTax = Number(calcTax.toFixed(2));
//         updatePayload.grandTotal = Number(calcGrand.toFixed(2));
//       }

//       // Update product stocks and log the changes

//       const finalGrandTotal =
//         typeof updatePayload.grandTotal === "number"
//           ? updatePayload.grandTotal
//           : supplierInvoice.grandTotal;

//       const paymentStatus = determinePaymentStatus(
//         finalGrandTotal,
//         amountPaid || 0,
//       );
//       const updatedInvoice = await SupplierInvoice.findByIdAndUpdate(
//         id,
//         {
//           ...updatePayload,
//           paymentStatus,
//           fulfilledAt:
//             isStatusChanged && targetFulfillmentStatus === "received"
//               ? new Date()
//               : null,
//         },
//         {
//           new: true,
//           session,
//         },
//       );
//       await session.commitTransaction();

//       res.status(200).json({
//         message: "success",
//         data: updatedInvoice,
//       });
//     } catch (err) {
//       await session.abortTransaction();
//       next(err);
//     } finally {
//       session.endSession();
//     }
//   },
// );

export const deleteSupplerInvoice = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { shouldRemoveStock } = req.body;
    const user = req.user;
    if (!user) {
      return next(
        new AppError(
          "Unauthorized action, Please make sure you are logged in",
          401,
        ),
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const supplierInvoice =
        await SupplierInvoice.findById(id).session(session);
      if (!supplierInvoice)
        throw new AppError(
          "Failed to find the supplier invoice you want delete",
          404,
        );
      const isLive = ["recevied", "partially-received"].includes(
        supplierInvoice.fulfillmentStatus,
      );

      const items = supplierInvoice.items.filter((i) => !i.isReturned);

      const itemsIds = items.map((i) => i.product.toString());
      const uniqueIds = new Set(itemsIds);

      if (uniqueIds.size !== itemsIds.length) {
        throw new Error("Duplicate products detected");
      }

      const totalUnitsBought = items.reduce(
        (acc, item) => (acc += item.quantity),
        0,
      );

      const shippingAndFeePerUnit =
        totalUnitsBought > 0
          ? supplierInvoice.shippingAndFees / totalUnitsBought
          : 0;

      if (isLive && shouldRemoveStock && items.length) {
        const dbProducts = await Product.find({
          _id: { $in: itemsIds },
        }).session(session);
        if (dbProducts.length !== itemsIds.length)
          throw new AppError(
            "One ore more products were not found while trying to delete the supplier invoice",
            404,
          );

        const productMap = new Map(
          dbProducts.map((p) => [p._id.toString(), p]),
        );

        const productStockUpdates: UpdateStock[] = [];

        const logs = items.map((i) => {
          const db = productMap.get(i.product.toString());
          if (!db)
            throw new AppError("One of the bought products doesn't exist", 404);

          const itemQty = i.quantity;
          const itemTotalCostBeforeTax = i.costPriceBeforeTax * itemQty;
          const itemTotalDiscountAmount =
            (itemTotalCostBeforeTax * (i.discountPercentage || 0)) / 100;
          const itemTotalTaxAmount =
            ((itemTotalCostBeforeTax - itemTotalDiscountAmount) *
              (i.taxRatePercentage || 0)) /
            100;
          const totalLineShippingCost = itemQty * shippingAndFeePerUnit;
          const totalItemCost =
            itemTotalCostBeforeTax -
            itemTotalDiscountAmount +
            itemTotalTaxAmount +
            totalLineShippingCost;

          let finalCalculatedWac = db.weightedAverageCost;
          const newStock = db.stock - itemQty;

          // Following the same logic above should we not recalculate the WAC of each deleted product entry? we just should set it to 0 if it is going to be negative or NaN ?
          // Reversing/Subtracting inventory value safely
          if (newStock <= 0) {
            finalCalculatedWac = 0;
          }

          // FIXED: Clamp calculation boundary array against breaking below zero
          if (finalCalculatedWac < 0 || isNaN(finalCalculatedWac)) {
            finalCalculatedWac = 0;
          }
          productStockUpdates.push({
            id: db._id.toString(),
            change: -i.quantity,
            currentStock: newStock,
            newWeightedAverageCost: Number(finalCalculatedWac.toFixed(2)),
          });
          return {
            product: db._id.toString(),
            previousStock: db.stock,
            change: -i.quantity,
            currentStock: newStock,
            user: user._id,
            referenceId: supplierInvoice._id,
            reason: "supplier-delete",
          };
        });

        await StockLogs.create(logs, { ordered: true, session });

        await updateProductsStock(productStockUpdates, session);
      }

      await SupplierInvoice.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      return res.status(201);
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);

// Here we need to make sure that the product is not already in the invoice, if it is then we need to tell the user to use the update supplier item instead of adding a new one.

export const addBoughtItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      newRetailPrice,
      newSalePrice,
      ...rest
    }: AddSupplierInvoiceItemInput = req.body;
    const user = req.user;
    if (!user)
      return next(new AppError("Unauthorized execution contextual block", 401));
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const supplierInvoice =
        await SupplierInvoice.findById(id).session(session);

      if (!supplierInvoice)
        throw new AppError("Supplier invoice sheet mismatch", 404);

      const newProductId = rest.product;
      // 1. Prevent duplicate active items
      const activeItemsBefore = supplierInvoice.items.filter(
        (i) => !i.isReturned,
      );
      if (
        activeItemsBefore.some((i) => i.product.toString() === newProductId)
      ) {
        throw new AppError(
          "You can't re-add an item that exists in the supplier invoice, instead you should update the supplier invoice item itself",
          400,
        );
      }
      const productIds = Array.from(
        new Set(activeItemsBefore.map((i) => i.product)),
      );

      const dbProducts = await Product.find({
        _id: { $in: productIds },
      }).session(session);
      if (dbProducts.length !== productIds.length) {
        throw new AppError(
          "One or more product does not exist inside the product catalog",
          404,
        );
      }
      const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

      const targetNewProduct = productMap.get(newProductId);
      if (!targetNewProduct)
        throw new AppError("Target inventory catalog index missing", 404);

      const workingItems = supplierInvoice.items;
      workingItems.push({
        ...rest,
        product: targetNewProduct._id,
        netLineTotal: 0,
        isReturned: false,
      });

      const totalShippingAndFees = supplierInvoice.shippingAndFees || 0;
      const oldTotalInvoiceQty = activeItemsBefore.reduce(
        (acc, item) => (acc += item.quantity),
        0,
      );
      const oldShippingCostPerUnit =
        oldTotalInvoiceQty > 0 ? totalShippingAndFees / oldTotalInvoiceQty : 0;

      const newTotalInvoiceQty = oldTotalInvoiceQty + rest.quantity;
      const newShippingCostPerUnit =
        newTotalInvoiceQty > 0 ? totalShippingAndFees / newTotalInvoiceQty : 0;

      const deltaShippingCostPerUnit =
        newShippingCostPerUnit - oldShippingCostPerUnit;

      let calcSubTotal = 0,
        calcTax = 0,
        calcDiscount = 0,
        calcGrand = 0;
      const productBulkOps: any[] = [];
      const stockLogs: any[] = [];

      const finalItems = workingItems.map((i) => {
        if (i.isReturned) return i; // We don't want to do anything different if the item is already returned
        const dbP = productMap.get(i.product.toString());

        if (!dbP) {
          throw new AppError(
            "One or more selected products do not exist.",
            404,
          );
        }

        const itemQty = Number(i.quantity) || 0;
        const lineGross = i.costPriceBeforeTax * itemQty;
        const lineDisc = (lineGross * (i.discountPercentage || 0)) / 100;
        const lineTax =
          ((lineGross - lineDisc) * (i.taxRatePercentage || 0)) / 100;

        const isNewItem = i.product.toString() === newProductId;

        const lineShipping = itemQty * newShippingCostPerUnit;

        i.netLineTotal = Number(
          (lineGross - lineDisc + lineTax + lineShipping).toFixed(2),
        );

        calcSubTotal += lineGross;
        calcDiscount += lineDisc;
        calcTax += lineTax;
        calcGrand += i.netLineTotal;

        let updatedWac = dbP.weightedAverageCost;

        const totalQty = isNewItem ? dbP.stock + itemQty : dbP.stock;

        if (isNewItem) {
          updatedWac = totalQty
            ? dbP.weightedAverageCost * dbP.stock + i.netLineTotal / totalQty
            : 0;

          stockLogs.push({
            product: dbP._id,
            change: itemQty,
            previousStock: dbP.stock,
            currentStock: dbP.stock + itemQty,
            reason: "restock",
            user: user._id,
            referenceId: supplierInvoice._id,
          });
        } else {
          updatedWac = totalQty
            ? dbP.weightedAverageCost * dbP.stock +
              (deltaShippingCostPerUnit * itemQty) / totalQty
            : 0;
        }

        if (updatedWac < 0 || isNaN(updatedWac)) updatedWac = 0;

        const productUpdateData: Record<string, any> = {
          weightedAverageCost: Number(updatedWac.toFixed(2)),
        };

        if (isNewItem) {
          productUpdateData.stock = dbP.stock + itemQty;
          productUpdateData.isAvailable = productUpdateData.stock > 0;
          if (newRetailPrice) productUpdateData.listPrice = newRetailPrice;
          if (newSalePrice) productUpdateData.salePrice = newSalePrice;
        }
        productBulkOps.push({
          updateOne: {
            filter: { _id: dbP._id },
            update: {
              $set: productUpdateData,
            },
          },
        });

        return i;
      });
      // 5. Commit operational records down to DB Collections
      if (stockLogs.length > 0) {
        await StockLogs.create(stockLogs, { session, ordered: true });
      }
      if (productBulkOps.length > 0) {
        await Product.bulkWrite(productBulkOps, { session, ordered: true });
      }

      // Update Parent Invoice Document state aggregates
      supplierInvoice.items = finalItems;
      supplierInvoice.subTotal = Number(calcSubTotal.toFixed(2));
      supplierInvoice.totalDiscount = Number(calcDiscount.toFixed(2));
      supplierInvoice.totalTax = Number(calcTax.toFixed(2));
      supplierInvoice.grandTotal = Number(calcGrand.toFixed(2));

      supplierInvoice.paymentStatus = determinePaymentStatus(
        supplierInvoice.grandTotal,
        supplierInvoice.amountPaid,
      );

      const updatedSupplierInvoice = await supplierInvoice.save({ session });
      await session.commitTransaction();

      return res.status(200).json({
        message: "success",
        data: updatedSupplierInvoice,
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },
);
export const updateSupplierItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, prodcutId } = req.params; // id = invoiceId, prodcutId = target product
    const {
      newRetailPrice,
      newSalePrice,
      ...rest
    }: UpdateSupplierInvoiceItemInput = req.body;

    const user = req.user;
    if (!user)
      return next(new AppError("Unauthorized action, Please log in", 401));

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const supplierInvoice =
        await SupplierInvoice.findById(id).session(session);
      if (!supplierInvoice)
        throw new AppError("Supplier invoice mismatch", 404);

      // 1. Locate the row targeted for adjustments safely without mutating array references
      const itemBeingUpdated = supplierInvoice.items.find(
        (i) => i.product.toString() === prodcutId,
      );
      if (!itemBeingUpdated)
        throw new AppError("Failed to find item inside invoice", 404);

      // Capture operational parameters before modification
      const oldQty = itemBeingUpdated.quantity;
      const oldIsReturned = itemBeingUpdated.isReturned;
      const oldNetLineTotal = itemBeingUpdated.netLineTotal || 0;

      // 2. Map payload parameters cleanly using strict type verification guards
      if (typeof rest.isReturned === "boolean")
        itemBeingUpdated.isReturned = rest.isReturned;
      if (typeof rest.quantity === "number")
        itemBeingUpdated.quantity = rest.quantity;
      if (typeof rest.costPriceBeforeTax === "number")
        itemBeingUpdated.costPriceBeforeTax = rest.costPriceBeforeTax;
      if (typeof rest.discountPercentage === "number")
        itemBeingUpdated.discountPercentage = rest.discountPercentage;
      if (typeof rest.taxRatePercentage === "number")
        itemBeingUpdated.taxRatePercentage = rest.taxRatePercentage;

      // Determine stock movement deltas
      let changeInStock = 0;
      let stockReason = "restock";

      if (oldIsReturned && !itemBeingUpdated.isReturned) {
        changeInStock = itemBeingUpdated.quantity;
      } else if (!oldIsReturned && itemBeingUpdated.isReturned) {
        changeInStock = -oldQty;
        stockReason = "supplier-return";
      } else if (!itemBeingUpdated.isReturned) {
        changeInStock = itemBeingUpdated.quantity - oldQty;
        if (changeInStock < 0) stockReason = "supplier-return";
      }

      // 3. Setup product catalog cache boundaries
      const activeItemsBefore = supplierInvoice.items.filter(
        (i) => !i.isReturned,
      );
      const productIds = Array.from(
        new Set(supplierInvoice.items.map((i) => i.product.toString())),
      );

      const dbProducts = await Product.find({
        _id: { $in: productIds },
      }).session(session);
      if (dbProducts.length !== productIds.length) {
        throw new AppError(
          "Associated catalog metrics are missing or mismatched",
          404,
        );
      }
      const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

      const dbProduct = productMap.get(itemBeingUpdated.product.toString());
      if (!dbProduct)
        throw new AppError("Database master catalog asset dropped", 404);

      // 4. Calculate Shipping Allocations Across Global Matrix
      const totalShippingAndFees = supplierInvoice.shippingAndFees || 0;
      const oldTotalInvoiceQty = activeItemsBefore.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      const oldShippingPerUnit =
        oldTotalInvoiceQty > 0 ? totalShippingAndFees / oldTotalInvoiceQty : 0;

      const activeItemsAfter = supplierInvoice.items.filter(
        (i) => !i.isReturned,
      );
      const newTotalInvoiceQty = activeItemsAfter.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      const newShippingPerUnit =
        newTotalInvoiceQty > 0 ? totalShippingAndFees / newTotalInvoiceQty : 0;
      const deltaShippingPerUnit = newShippingPerUnit - oldShippingPerUnit;

      const productsUpdate: any[] = [];
      let calcSubTotal = 0,
        calcDiscount = 0,
        calcTax = 0,
        calcGrand = 0;

      // 5. Apply Single Loop Row Map Calculations
      const finalItems = supplierInvoice.items.map((i) => {
        if (i.isReturned) return i;

        const dbP = productMap.get(i.product.toString());
        if (!dbP)
          throw new AppError("One of the bought products doesn't exist", 404);

        const isSameItemBeingUpdated =
          i.product.toString() === itemBeingUpdated.product.toString();
        const itemQty = Number(i.quantity) || 0;

        const lineGross = i.costPriceBeforeTax * itemQty;
        const lineDisc = (lineGross * (i.discountPercentage || 0)) / 100;
        const lineTax =
          ((lineGross - lineDisc) * (i.taxRatePercentage || 0)) / 100;
        const lineShipping = itemQty * newShippingPerUnit;

        const currentItemNetLineTotal =
          lineGross - lineDisc + lineTax + lineShipping;

        // Retain original net total value state for the calculation engine update step
        const localItemDeltaNetLineTotal =
          currentItemNetLineTotal -
          (isSameItemBeingUpdated ? oldNetLineTotal : i.netLineTotal || 0);
        i.netLineTotal = Number(currentItemNetLineTotal.toFixed(2));

        calcSubTotal += lineGross;
        calcDiscount += lineDisc;
        calcTax += lineTax;
        calcGrand += i.netLineTotal;

        // WAC Calculation Logic Rules Engine
        let updatedWac = dbP.weightedAverageCost;
        const finalStockPool =
          dbP.stock + (isSameItemBeingUpdated ? changeInStock : 0);

        if (isSameItemBeingUpdated) {
          if (changeInStock > 0) {
            const addedStockValue = (i.netLineTotal / itemQty) * changeInStock;
            updatedWac =
              finalStockPool > 0
                ? (dbP.weightedAverageCost * dbP.stock + addedStockValue) /
                  finalStockPool
                : 0;
          } else if (changeInStock < 0) {
            updatedWac =
              finalStockPool > 0
                ? (dbP.weightedAverageCost * dbP.stock - oldNetLineTotal) /
                  finalStockPool
                : dbP.weightedAverageCost; // why are we setting it to the old WAC?  and above we are setting it to 0 if the change is stock is positive?
          } else {
            if (dbP.stock > 0) {
              updatedWac =
                (dbP.weightedAverageCost * dbP.stock +
                  localItemDeltaNetLineTotal) /
                dbP.stock;
            }
          }
        } else {
          // Adjust non-updated active items for global shipping changes
          if (dbP.stock > 0 && deltaShippingPerUnit !== 0) {
            const nonTargetShippingAdjustment = itemQty * deltaShippingPerUnit;
            updatedWac =
              (dbP.weightedAverageCost * dbP.stock +
                nonTargetShippingAdjustment) /
              dbP.stock;
          }
        }

        if (updatedWac < 0 || isNaN(updatedWac)) updatedWac = 0;

        // Build Product Updates With Correct Sibling Operators Block Formats
        const setPayload: Record<string, any> = {
          weightedAverageCost: Number(updatedWac.toFixed(2)),
          isAvailable: finalStockPool > 0,
        };

        if (isSameItemBeingUpdated) {
          if (newRetailPrice) setPayload.listPrice = newRetailPrice;
          if (newSalePrice) setPayload.salePrice = newSalePrice;

          productsUpdate.push({
            updateOne: {
              filter: { _id: dbP._id },
              update: {
                $inc: { stock: changeInStock },
                $set: setPayload,
              },
            },
          });
        } else if (deltaShippingPerUnit !== 0) {
          productsUpdate.push({
            updateOne: {
              filter: { _id: dbP._id },
              update: { $set: setPayload },
            },
          });
        }

        return i;
      });

      // 6. Bulk write down changes to database
      if (productsUpdate.length > 0) {
        await Product.bulkWrite(productsUpdate, { session, ordered: true });
      }

      if (changeInStock !== 0) {
        await StockLogs.create(
          [
            {
              product: dbProduct._id,
              change: changeInStock,
              previousStock: dbProduct.stock,
              currentStock: dbProduct.stock + changeInStock,
              reason: stockReason,
              referenceId: supplierInvoice._id,
              user: user._id,
            },
          ],
          { session, ordered: true },
        );
      }

      // 7. Save calculated invoice fields (FIXED: Overwrote += with direct assignments)
      supplierInvoice.items = finalItems;
      supplierInvoice.subTotal = Number(calcSubTotal.toFixed(2));
      supplierInvoice.totalDiscount = Number(calcDiscount.toFixed(2));
      supplierInvoice.totalTax = Number(calcTax.toFixed(2));
      supplierInvoice.grandTotal = Number(calcGrand.toFixed(2));

      supplierInvoice.paymentStatus = determinePaymentStatus(
        supplierInvoice.grandTotal,
        supplierInvoice.amountPaid,
      );

      const finalSupplierInvoice = await supplierInvoice.save({ session });
      await session.commitTransaction();

      return res.status(200).json({
        message: "success",
        data: finalSupplierInvoice,
      });
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);

export const deleteSupplierItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, productId } = req.params;
    const { shouldRemoveStock } = req.body; // true = pull from shelves, false = keep on shelves (bookkeeping change)
    const user = req.user;

    if (!user)
      return next(new AppError("Unauthorized action, please log in", 401));

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const supplierInvoice =
        await SupplierInvoice.findById(id).session(session);
      if (!supplierInvoice)
        throw new AppError(`Failed to find supplier invoice`, 404);

      const itemBeingDeleted = supplierInvoice.items.find(
        (i) => i.product.toString() === productId,
      );
      if (!itemBeingDeleted)
        throw new AppError(`Item not found inside invoice`, 404);

      const activeItemsBefore = supplierInvoice.items.filter(
        (i) => !i.isReturned,
      );
      const oldTotalInvoiceQty = activeItemsBefore.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      const totalShippingAndFees = supplierInvoice.shippingAndFees || 0;
      const oldShippingPerUnit =
        oldTotalInvoiceQty > 0 ? totalShippingAndFees / oldTotalInvoiceQty : 0;

      // Calculate new invoice quantity metrics without the deleted item
      const isDeletedActive = !itemBeingDeleted.isReturned;
      const newTotalInvoiceQty =
        oldTotalInvoiceQty - (isDeletedActive ? itemBeingDeleted.quantity : 0);
      const newShippingPerUnit =
        newTotalInvoiceQty > 0 ? totalShippingAndFees / newTotalInvoiceQty : 0;
      const deltaShippingPerUnit = newShippingPerUnit - oldShippingPerUnit;

      const productIds = Array.from(
        new Set(supplierInvoice.items.map((i) => i.product.toString())),
      );
      const dbProducts = await Product.find({
        _id: { $in: productIds },
      }).session(session);
      if (dbProducts.length !== productIds.length) {
        throw new AppError(
          "Associated catalog metrics are missing or mismatched",
          404,
        );
      }
      const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

      const dbProductOfDeleted = productMap.get(
        itemBeingDeleted.product.toString(),
      );
      if (!dbProductOfDeleted)
        throw new AppError("Database master catalog asset dropped", 404);

      let calcSubTotal = 0,
        calcDiscount = 0,
        calcTax = 0,
        calcGrand = 0;
      const productsUpdate: any[] = [];

      // Loop over ALL items to process WAC shifts and invoice global reductions
      supplierInvoice.items.forEach((i) => {
        const isTarget = i.product.toString() === productId;
        const dbP = productMap.get(i.product.toString());
        if (!dbP) throw new AppError("Product reference corrupted", 404);

        const itemQty = i.quantity;

        // 1. If this is the target line item being dropped
        if (isTarget) {
          if (shouldRemoveStock && !i.isReturned) {
            const finalStockPool = dbP.stock - itemQty;
            let updatedWac = dbP.weightedAverageCost;

            // Strip the exact financial cost weight of this batch out of your warehouse pool
            if (finalStockPool > 0) {
              updatedWac =
                (dbP.weightedAverageCost * dbP.stock - (i.netLineTotal || 0)) /
                finalStockPool;
            } else {
              updatedWac = 0;
            }

            if (updatedWac < 0 || isNaN(updatedWac)) updatedWac = 0;

            productsUpdate.push({
              updateOne: {
                filter: { _id: dbP._id },
                update: {
                  $inc: { stock: -itemQty },
                  $set: {
                    weightedAverageCost: Number(updatedWac.toFixed(2)),
                    isAvailable: finalStockPool > 0,
                  },
                },
              },
            });
          }
          return; // Skip accumulating financial totals for the deleted item line row
        }

        // 2. For all remaining retained items on the invoice
        if (i.isReturned) return;

        const lineGross = i.costPriceBeforeTax * itemQty;
        const lineDisc = (lineGross * (i.discountPercentage || 0)) / 100;
        const lineTax =
          ((lineGross - lineDisc) * (i.taxRatePercentage || 0)) / 100;
        const lineShipping = itemQty * newShippingPerUnit;

        i.netLineTotal = Number(
          (lineGross - lineDisc + lineTax + lineShipping).toFixed(2),
        );

        // Accumulate running invoice sums for remaining lines
        calcSubTotal += lineGross;
        calcDiscount += lineDisc;
        calcTax += lineTax;
        calcGrand += i.netLineTotal;

        // Adjust WAC of remaining items because their distributed shipping cost share went up
        if (dbP.stock > 0 && deltaShippingPerUnit !== 0) {
          const lineShippingAdjustment = itemQty * deltaShippingPerUnit;
          let updatedWac =
            (dbP.weightedAverageCost * dbP.stock + lineShippingAdjustment) /
            dbP.stock;

          if (updatedWac < 0 || isNaN(updatedWac)) updatedWac = 0;

          productsUpdate.push({
            updateOne: {
              filter: { _id: dbP._id },
              update: {
                $set: { weightedAverageCost: Number(updatedWac.toFixed(2)) },
              },
            },
          });
        }
      });

      // 3. Commit Bulk Writes down to collections
      if (productsUpdate.length > 0) {
        await Product.bulkWrite(productsUpdate, { session, ordered: true });
      }

      if (shouldRemoveStock && isDeletedActive) {
        await StockLogs.create(
          [
            {
              product: dbProductOfDeleted._id,
              change: -itemBeingDeleted.quantity,
              previousStock: dbProductOfDeleted.stock,
              currentStock:
                dbProductOfDeleted.stock - itemBeingDeleted.quantity,
              reason: "supplier-delete",
              referenceId: supplierInvoice._id,
              user: user._id,
            },
          ],
          { session, ordered: true },
        );
      }

      // Filter the deleted item out of the array completely
      supplierInvoice.items = supplierInvoice.items.filter(
        (item) => item.product.toString() !== productId,
      );

      // Save absolute, recalculated global values
      supplierInvoice.subTotal = Number(calcSubTotal.toFixed(2));
      supplierInvoice.totalDiscount = Number(calcDiscount.toFixed(2));
      supplierInvoice.totalTax = Number(calcTax.toFixed(2));
      supplierInvoice.grandTotal = Number(calcGrand.toFixed(2));

      supplierInvoice.paymentStatus = determinePaymentStatus(
        supplierInvoice.grandTotal,
        supplierInvoice.amountPaid,
      );

      const updatedSupplierInvoice = await supplierInvoice.save({ session });
      await session.commitTransaction();

      return res.status(200).json({
        message: "success",
        data: updatedSupplierInvoice,
      });
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);
// export const addBoughtItem = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;
//     const {
//       newRetailPrice,
//       newSalePrice,
//       ...rest
//     }: AddSupplierInvoiceItemInput = req.body;

//     const user = req.user;
//     if (!user)
//       return next(new AppError("Unauthorized execution contextual block", 401));

//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const supplierInvoice =
//         await SupplierInvoice.findById(id).session(session);
//       if (!supplierInvoice)
//         throw new AppError("Supplier invoice sheet mismatch", 404);

//       // if the same items do exist inside the supplier invoice but they are returned you can still add the item into the invoice. BUT you have to add a feature on the 'updateSupplierItem' controller as to when the user clicked to unreturned the same item it should add the 2 in one entry.
//       const items = supplierInvoice.items.filter((i) => !i.isReturned);
//       // Check if the product is already exists inside the supplier invoice, if so the admin should have used the updateSupplierItem instead of trying to froce add and item.
// const newProductId = rest.product.toString();
//       if (items.some((i) => i.product.toString() === rest.product)) {
//         throw new AppError(
//           "You can't re-add an item that exists in the supplier invoce, instead you should update the supplier invoice item itself",
//           400,
//         );
//       }
// // 2. Fetch all products on the invoice + the new product to update their WAC adjustments
//       const allProductIds = Array.from(new Set([
//         ...supplierInvoice.items.map((i) => i.product.toString()),
//         newProductId
//       ]));

//       const dbProducts = await Product.find({ _id: { $in: allProductIds } }).session(session);
//       const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

//       const targetNewProduct = productMap.get(newProductId);
//       if (!targetNewProduct) throw new AppError("Target inventory catalog index missing", 404);
//  ;

//       const totalUnitsBought = items.reduce(
//         (acc, item) => acc + item.quantity,
//         0,
//       );
//       const itemQty = Number(rest.quantity) || 0;
//       const totalQty = itemQty + totalUnitsBought;
//       const newShippingCostPerUnit =
//         totalQty > 0 ? supplierInvoice.shippingAndFees / totalQty : 0;

//       const totalQuantityOfProduct = targetNewProduct.stock + itemQty;
//       const totalItemGrossPrice = rest.costPriceBeforeTax * rest.quantity;

//       const totalItemDiscountPrice =
//         (totalItemGrossPrice * (rest.discountPercentage || 0)) / 100;

//       const totalItemTaxAmount =
//         ((totalItemGrossPrice - totalItemDiscountPrice) *
//           (rest.taxRatePercentage || 0)) /
//         100;

//       const itemGrandTotal =
//         totalItemGrossPrice - totalItemDiscountPrice + totalItemTaxAmount;
//       const netLineTotal = itemGrandTotal + itemQty * newShippingCostPerUnit;

//       const newWac =
//         totalQuantityOfProduct > 0
//           ? (targetNewProduct.weightedAverageCost * targetNewProduct.stock + netLineTotal) /
//             totalQuantityOfProduct
//           : 0;

//       const updatedData: Record<string, any> = {
//         stock: targetNewProduct.stock + rest.quantity,
//         weightedAverageCost: newWac,
//       };

//       if (newRetailPrice) updatedData.listPrice = newRetailPrice;
//       if (newSalePrice) updatedData.salePrice = newSalePrice;

//       await Product.findByIdAndUpdate(targetNewProduct._id, updatedData).session(
//         session,
//       );

//       await StockLogs.create(
//         [
//           {
//             product: targetNewProduct._id,
//             change: rest.quantity,
//             previousStock: targetNewProduct.stock,
//             currentStock: targetNewProduct.stock + rest.quantity,
//             reason: "restock",
//             user: user._id,
//           },
//         ],
//         { session, ordered: true },
//       );

//       const finalSupplierInvoiceItems = supplierInvoice.items.map((item) => {
//         const isReturned = item.isReturned;

//         const qty = Number(item.quantity) || 0;
//         const totalCostBeforeTax = item.costPriceBeforeTax * qty;
//         const totalDiscountPrice =
//           (totalCostBeforeTax * (item.discountPercentage || 0)) / 100;
//         const costPrice = totalCostBeforeTax - totalDiscountPrice;
//         const totalTaxAmount =
//           (costPrice * (item.taxRatePercentage || 0)) / 100;
//         const netLineShipping = newShippingCostPerUnit * qty;
//         const netLineTotal = costPrice + totalTaxAmount + netLineShipping;

//         return isReturned ? item : { ...item, netLineTotal };
//       });

//       supplierInvoice.items = [
//         ...finalSupplierInvoiceItems,
//         {
//           ...rest,
//           product: targetNewProduct._id,
//           netLineTotal,
//         },
//       ];
//       supplierInvoice.subTotal += Number(netLineTotal.toFixed(2));
//       supplierInvoice.totalDiscount += Number(
//         totalItemDiscountPrice.toFixed(2),
//       );
//       supplierInvoice.totalTax += Number(totalItemTaxAmount.toFixed(2));
//       supplierInvoice.grandTotal += Number(itemGrandTotal.toFixed(2));
//       const updatedSupplierInvoice = await supplierInvoice.save({ session });

//       await session.commitTransaction();
//       res.status(200).json({
//         message: "success",
//         data: updatedSupplierInvoice,
//       });
//     } catch (err) {
//       await session.abortTransaction();
//       return next(err);
//     } finally {
//       session.endSession();
//     }
//   },
// );

// export const updateSupplierItem = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id, prodcutId } = req.params;
//     const {
//       newRetailPrice,
//       newSalePrice,
//       ...rest
//     }: UpdateSupplierInvoiceItemInput = req.body;

//     const user = req.user;
//     if (!user) {
//       return next(
//         new AppError(
//           "Unauthorized action, Please make sure you are logged in",
//           401,
//         ),
//       );
//     }
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const supplierInvoice =
//         await SupplierInvoice.findById(id).session(session);
//       if (!supplierInvoice)
//         throw new AppError(
//           "Target base document reference assignment down",
//           404,
//         );

//       const itemBeingUpdated = supplierInvoice.items.find(
//         (i) => i.product.toString() === prodcutId,
//       );
//       if (!itemBeingUpdated)
//         throw new AppError(
//           "Failed to find the related item you are looking to update inside the supplier invoice",
//           404,
//         );

//       const activeItems = supplierInvoice.items.filter((i) => !i.isReturned);

//       const productIds = Array.from(
//         new Set(activeItems.map((i) => i.product.toString())),
//       );

//       if (activeItems.length !== productIds.length)
//         throw new AppError(
//           "Either you added duplicates of the same product in the main supplier invoice, or one or more product don't exist anymore",
//           404,
//         );

//       const dbProducts = await Product.find({
//         _id: { $in: productIds },
//       }).session(session);
//       if (!dbProducts)
//         throw new AppError(
//           "Failed to grab the associated products for the supplier invoce",
//           400,
//         );

//       if (!dbProducts)
//         throw new AppError("Database master catalogue asset dropped", 404);

//       const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

//       const dbProduct = productMap.get(itemBeingUpdated.product.toString());

//       if (!dbProduct)
//         throw new AppError(
//           "Failed to find the related product you are looking to update inside the product catalog",
//           404,
//         );

//       // Old item values

//       const finalIsReturned =
//         typeof rest.isReturned === "boolean"
//           ? rest.isReturned
//           : itemBeingUpdated.isReturned;

//       const finalCostBeforeTax =
//         typeof rest.costPriceBeforeTax === "number"
//           ? rest.costPriceBeforeTax
//           : itemBeingUpdated.costPriceBeforeTax;

//       const finalDiscountPercentage =
//         typeof rest.discountPercentage === "number"
//           ? rest.discountPercentage
//           : itemBeingUpdated.discountPercentage;

//       const finalTaxRatePercentage =
//         typeof rest.taxRatePercentage === "number"
//           ? rest.taxRatePercentage
//           : itemBeingUpdated.taxRatePercentage;

//       const finalQuantity =
//         typeof rest.quantity === "number"
//           ? rest.quantity
//           : itemBeingUpdated.quantity;

//       const oldTotalGrossPrice = itemBeingUpdated.isReturned
//         ? 0
//         : itemBeingUpdated.costPriceBeforeTax * itemBeingUpdated.quantity;
//       const oldTotalDiscountPrice = itemBeingUpdated.isReturned
//         ? 0
//         : (oldTotalGrossPrice * itemBeingUpdated.discountPercentage) / 100;
//       const oldTotalTaxAmount = itemBeingUpdated.isReturned
//         ? 0
//         : ((oldTotalGrossPrice - oldTotalDiscountPrice) *
//             itemBeingUpdated.taxRatePercentage) /
//           100;
//       const oldGrandTotal =
//         oldTotalGrossPrice - oldTotalDiscountPrice + oldTotalTaxAmount;

//       // New itemBeingUpdated values

//       const newTotalGrossPrice = finalIsReturned
//         ? 0
//         : finalCostBeforeTax * finalQuantity;
//       const newTotalDiscountPrice = finalIsReturned
//         ? 0
//         : (newTotalGrossPrice * finalDiscountPercentage) / 100;
//       const newTotalTaxAmount = finalIsReturned
//         ? 0
//         : ((newTotalGrossPrice - newTotalDiscountPrice) *
//             finalTaxRatePercentage) /
//           100;

//       const isReturnedAndEnteringNotReturned =
//         finalIsReturned === false && itemBeingUpdated.isReturned === true;
//       const newGrandTotal =
//         newTotalGrossPrice - newTotalDiscountPrice + newTotalTaxAmount;

//       const changeInStock = finalQuantity - itemBeingUpdated.quantity;

//       const deltaGrossPrice = newTotalGrossPrice - oldTotalGrossPrice;

//       const deltaDiscount = newTotalDiscountPrice - oldTotalDiscountPrice;

//       const deltaGrandTotal = newGrandTotal - oldGrandTotal;

//       const oldTotalInvoiceQty = activeItems.reduce(
//         (acc, item) => (acc += item.quantity),
//         0,
//       );
//       const newTotalInvoiceQty = oldTotalInvoiceQty + changeInStock;
//       const oldShippingPerUnit =
//         oldTotalInvoiceQty > 0
//           ? supplierInvoice.shippingAndFees / oldTotalInvoiceQty
//           : 0;
//       const newShippingPerUnit =
//         newTotalInvoiceQty > 0
//           ? supplierInvoice.shippingAndFees / newTotalInvoiceQty
//           : 0;
//       const deltaShippingPerUnit = newShippingPerUnit - oldShippingPerUnit;

//       const workingItems = supplierInvoice.items;

//       workingItems.push(itemBeingUpdated);

//       const productsUpdate: any[] = [];

//       let calcSubTotal = 0,
//         calcDiscount = 0,
//         calcTax = 0,
//         calcGrand = 0;
//       const finalItems = workingItems.map((i) => {
//         if (i.isReturned) return i;
//         const dbP = productMap.get(i.product.toString());
//         if (!dbP) throw new Error("One of the bought products doesn't exist");

//         const isSameItemBeingUpdated =
//           i.product.toString() === itemBeingUpdated.product.toString();

//         const itemQty = Number(i.quantity) || 0;
//         const lineGross = i.costPriceBeforeTax * itemQty;
//         const lineDisc = (lineGross * (i.discountPercentage || 0)) / 100;
//         const lineTax =
//           ((lineGross - lineDisc) * (i.taxRatePercentage || 0)) / 100;
//         const lineShipping = itemQty * newShippingPerUnit;
//         const netLineTotal = lineGross - lineDisc + lineTax + lineShipping;
//         // This will be used to calculate the delta of the net line total for the item being updated, so we can adjust the grand total of the supplier invoice accordingly.
//         const deltaNetLineTotal = netLineTotal - i.netLineTotal;
//         i.netLineTotal = Number(netLineTotal.toFixed(2)) || 0;

//         let updatedWac = dbP.weightedAverageCost;
//         const totalQty = isSameItemBeingUpdated
//           ? dbP.stock + changeInStock
//           : dbP.stock;

//         // The only time we need to update the weighted average cost is when there is a change in stock and the shipping per unit has changed, otherwise we don't need to update the weighted average cost for the whole supplier invoice products and you just need to update WAC for the product reltated to the item being updated.

//         if (totalQty > 0) {
//           if (isSameItemBeingUpdated) {
//             updatedWac =
//               (dbP.weightedAverageCost * dbP.stock + deltaNetLineTotal) /
//               totalQty;
//           } else {
//             updatedWac =
//               (dbP.weightedAverageCost * dbP.stock +
//                 deltaShippingPerUnit * itemQty) /
//               totalQty;
//           }
//         } else {
//           // Should we set the weighted average cost to zero if the stock is zero? This might be a business decision, but for now, let's set it to zero to avoid negative or NaN values.
//           updatedWac = 0;
//         }

//         if (updatedWac < 0 || isNaN(updatedWac)) updatedWac = 0;
//         if (
//           changeInStock &&
//           deltaShippingPerUnit !== 0 &&
//           !isSameItemBeingUpdated
//         ) {
//           productsUpdate.push({
//             updateOne: {
//               filter: { _id: dbP._id },
//               update: {
//                 $set: {
//                   weightedAverageCost: Number(updatedWac.toFixed(2)),
//                   isAvailable: totalQty > 0,
//                 },
//               },
//             },
//           });
//         } else if (isSameItemBeingUpdated) {
//           productsUpdate.push({
//             updateOne: {
//               filter: { _id: dbP._id },
//               update: {
//                              $inc: { stock: changeInStock },
//                 $set: {

//                   weightedAverageCost: Number(updatedWac.toFixed(2)),
//                   isAvailable: totalQty > 0,
//                 },
//               },
//             },
//           });
//         }

//         calcSubTotal += lineGross;
//         calcDiscount += lineDisc;
//         calcTax += lineTax;
//         calcGrand += i.netLineTotal;

//         return i;
//       });

//       await Product.bulkWrite(productsUpdate, { session, ordered: true });

//       if (changeInStock !== 0) {
//         await StockLogs.create(
//           [
//             {
//               product: dbProduct._id,
//               change: changeInStock,
//               previousStock: dbProduct.stock,
//               currentStock: dbProduct.stock + changeInStock,
//               reason: finalIsReturned ? "supplier-return" : "restock",
//               referenceId: supplierInvoice._id,
//               user: user._id,
//             },
//           ],
//           { session, ordered: true },
//         );
//       }

//       supplierInvoice.items = finalItems;
//       supplierInvoice.subTotal = Number(calcSubTotal.toFixed(2));
//       supplierInvoice.totalDiscount = Number(calcDiscount.toFixed(2));
//       supplierInvoice.grandTotal = Number(calcGrand.toFixed(2));
//       const finalSupplierInvoice = await supplierInvoice.save({ session });

//       await session.commitTransaction();
//       res.status(200).json({
//         message: "success",
//         data: finalSupplierInvoice,
//       });
//     } catch (err) {
//       await session.abortTransaction();
//       return next(err);
//     } finally {
//       session.endSession();
//     }
//   },
// );

// ! When you refactor this controller you need to adjust the stock and the weighted average cost with the shipping cost inmind, so you will have to recalculate the wac based on the units again the product when an item is deleted from the supplier invoice.
// export const deleteSupplierItem = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id, productId } = req.params;
//     const { shouldRemoveStock } = req.body;
//     const user = req.user;
//     if (!user) {
//       return next(
//         new AppError(
//           "Unauthorized action, Please make sure you are logged in",
//           401,
//         ),
//       );
//     }
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const supplierInvoice =
//         await SupplierInvoice.findById(id).session(session);

//       if (!supplierInvoice)
//         throw new AppError(`Failed to find supplier invoice`, 404);

//       const itemBeingDeleted = supplierInvoice.items.find(
//         (i) => i.product.toString() === productId,
//       );

//       if (!itemBeingDeleted)
//         throw new AppError(
//           `Failed to find the item you are trying to delete inside the supplier invoice`,
//           404,
//         );
//       const activeItemsBefore = supplierInvoice.items.filter(
//         (i) => !i.isReturned,
//       );
//       const productIds = Array.from(
//         new Set(activeItemsBefore.map((i) => i.product.toString())),
//       );

//       const dbProducts = await Product.find({
//         _id: { $in: productIds },
//       }).session(session);

//       if (dbProducts.length !== productIds.length) {
//         throw new AppError(
//           "Associated catalog metrics are missing or mismatched",
//           404,
//         );
//       }
//       const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

//       const dbProduct = productMap.get(itemBeingDeleted.product.toString());
//       if (!dbProduct)
//         throw new AppError("Database master catalog asset dropped", 404);

//       if (!dbProduct)
//         throw new AppError(
//           `Failed to find a product with the ID: ${productId}`,
//           404,
//         );

//       const oldTotalInvoiceQty = activeItemsBefore.reduce(
//         (acc, item) => acc + item.quantity,
//         0,
//       );
//       const oldShippingCostPerUnit =
//         oldTotalInvoiceQty > 0
//           ? supplierInvoice.shippingAndFees / oldTotalInvoiceQty
//           : 0;

//       const newTotalInvoiceQty =
//         oldTotalInvoiceQty -
//         (shouldRemoveStock ? itemBeingDeleted.quantity : 0);

//       const newShippingCostPerUnit =
//         newTotalInvoiceQty > 0
//           ? supplierInvoice.shippingAndFees / newTotalInvoiceQty
//           : 0;

//       const deltaShippingPerUnit =
//         newShippingCostPerUnit - oldShippingCostPerUnit;

//       const productsUpdate: any[] = [];
//       let calcSubTotal = 0,
//         calcDiscount = 0,
//         calcTax = 0,
//         calcGrand = 0;
//       const finalItems = supplierInvoice.items.map((i) => {
//         if (i.isReturned) return i;

//         const isSameItemBeingDelete = i.product === itemBeingDeleted.product;
//         const dbP = productMap.get(i.product.toString());
//         if (!dbP)
//           throw new AppError(
//             "One of the bought products doesn't exist in the database",
//             404,
//           );

//         const itemQty = Number(i.quantity) || 0;
//         const lineGross = i.costPriceBeforeTax * itemQty;
//         const lineDisc = (lineGross * (i.discountPercentage || 0)) / 100;
//         const lineTax =
//           ((lineGross - lineDisc) * (i.taxRatePercentage || 0)) / 100;
//         const lineShipping = itemQty * newShippingCostPerUnit;
//         const netLineTotal = lineGross - lineDisc + lineTax + lineShipping;

//         const oldNetLineTotal = i.netLineTotal || 0;

//         i.netLineTotal = Number(netLineTotal.toFixed(2)) || 0;
//         const deltaNetLineTotal = netLineTotal - oldNetLineTotal;

//         if (shouldRemoveStock) {
//           calcSubTotal += isSameItemBeingDelete ? lineGross : 0;
//           calcDiscount += isSameItemBeingDelete ? lineDisc : 0;
//           calcTax += isSameItemBeingDelete ? lineTax : 0;
//           calcGrand += isSameItemBeingDelete ? i.netLineTotal : 0;
//         }

//         let updatedWac = dbP.weightedAverageCost;
//         const totalQty = shouldRemoveStock ? dbP.stock - itemQty : dbP.stock;

//         if (deltaNetLineTotal !== 0 && shouldRemoveStock) {
//           const setPayload: Record<string, any> = {
//             weightedAverageCost: Number(updatedWac.toFixed(2)),
//             isAvailable: totalQty > 0,
//           };

//           if (totalQty > 0) {
//             updatedWac =
//               (dbP.weightedAverageCost + deltaNetLineTotal * itemQty) /
//               totalQty;
//           } else {
//             updatedWac = 0;
//           }

//           if (updatedWac < 0 || isNaN(updatedWac)) updatedWac = 0;

//           if (isSameItemBeingDelete) {
//             productsUpdate.push({
//               updateOne: {
//                 filter: { _id: dbP._id },
//                 update: {
//                   $inc: { stock: -itemQty },
//                   $set: setPayload,
//                 },
//               },
//             });
//           } else {
//             productsUpdate.push({
//               updateOne: {
//                 filter: { _id: dbP._id },
//                 update: {
//                   $set: setPayload,
//                 },
//               },
//             });
//           }
//         }

//         return isSameItemBeingDelete ? null : i;
//       });

//       if (productsUpdate.length > 0) {
//         await Product.bulkWrite(productsUpdate, { session, ordered: true });
//       }

//       if (shouldRemoveStock) {
//         await StockLogs.create(
//           [
//             {
//               product: dbProduct._id,
//               change: -itemBeingDeleted.quantity,
//               previousStock: dbProduct.stock,
//               currentStock: dbProduct.stock - itemBeingDeleted.quantity,
//               reason: "supplier-delete",
//               referenceId: supplierInvoice._id,
//               user: user._id,
//             },
//           ],
//           { session, ordered: true },
//         );
//       }
//       supplierInvoice.items = finalItems.filter((i) => i !== null);
//       supplierInvoice.subTotal = Number(calcSubTotal.toFixed(2));
//       supplierInvoice.totalDiscount = Number(calcDiscount.toFixed(2));
//       supplierInvoice.totalTax = Number(calcTax.toFixed(2));
//       supplierInvoice.grandTotal = Number(calcGrand.toFixed(2));
//       const updatedSupplierInvoice = await supplierInvoice.save({ session });
//       await session.commitTransaction();

//       res.status(200).json({
//         message: "success",
//         data: updatedSupplierInvoice,
//       });
//     } catch (err) {
//       await session.abortTransaction();
//       return next(err);
//     } finally {
//       session.endSession();
//     }
//   },
// );
