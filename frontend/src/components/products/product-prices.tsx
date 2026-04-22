import { formatCurrency, formatNumber } from "@lib/helper";
import { Product } from "@lib/types";
import { cn } from "@lib/utils";
import React from "react";

interface Props {
  className?: string;
  product: Product;
}
const ProductPrices = ({ product, className }: Props) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {product.salePrice ? (
        <span className=" text-green-500 dark:text-green-600">
          {formatCurrency(product.salePrice)}
        </span>
      ) : null}

      <span
        className={`text-muted-foreground ${
          product.salePrice && "  line-through"
        }`}
      >
        {formatNumber(product.listPrice)}
      </span>
    </div>
  );
};

export default ProductPrices;
