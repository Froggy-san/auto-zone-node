import supabase from "@utils/supabase";

export async function checkStock(
  quantityData: { id: number; quantity: number }[],
): Promise<{ isOutOfStock: boolean; names: string | null }> {
  try {
    const itemIds = quantityData.map((item) => item.id);
    const { data: currentProducts, error: productStockError } = await supabase
      .from("product")
      .select("id, stock, name")
      .in("id", itemIds);
    if (productStockError) {
      throw new Error(productStockError.message);
    }
    // 2. Compare cart quantity vs actual database quantity
    const outOfStockItems = currentProducts.filter((currProduct) => {
      const item = quantityData?.find((p) => p.id === currProduct.id);
      return item && item.quantity > currProduct.stock;
    });

    // 3. Stop them if something is wrong
    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map((i) => i.name).join(", ");

      return { isOutOfStock: true, names };
    }
    return { isOutOfStock: false, names: null };
  } catch (error: any) {
    const errorMessage = `Failed to get the available stocks of the products: ${error.message}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}
