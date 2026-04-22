"use server";

import { AUTH_TOEKN_NAME, PAGE_SIZE } from "@lib/constants";
import { getAllCategories } from "@lib/data-service";
import { getToken } from "@lib/helper";
import {
  Category,
  CategoryProps,
  Product,
  ProductBoughtSchema,
} from "@lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createRestockingBillAction,
  editRestockingBillAction,
} from "./restockingBillActions";
import { createClient } from "@utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

interface GetProdcutsBoughtActionProps {
  pageNumber?: string;
  name?: string;
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}

export async function getProductsBoughtAction({
  pageNumber,
  name,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: GetProdcutsBoughtActionProps) {
  //Product?PageNumber=1&PageSize=10
  // /api/Product?Name=test&CategoryId=1&ProductTypeId=1&ProductBrandId=1&IsAvailable=true&PageNumber=1&PageSize=10
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/ProductBought?&PageSize=${PAGE_SIZE}`;

  if (name) query = query + `&Name=${name}`;
  if (pageNumber) query = query + `&PageNumber=${pageNumber}`;

  if (dateOfOrderFrom) query = query + `&dateOfOrderFrom=${dateOfOrderFrom}`;

  if (dateOfOrderTo) query = query + `&dateOfOrderTo=${dateOfOrderTo}`;

  if (minTotalPrice) query = query + `&minTotalPrice=${minTotalPrice}`;

  if (maxTotalPrice) query = query + `&maxTotalPrice=${maxTotalPrice}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    next: {
      // revalidate: 3600,
      tags: [
        "productsBought",
        // `${pageNumber}`,
        // `${name}`,
        // `${categoryId}`,
        // `${productTypeId}`,
        // `${productBrandId}`,
        // `${isAvailable}`,
      ],
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const categories = await getAllCategories();

  const data = (await response.json()) as Product[];

  const productsWithCategories = data.map((product) => {
    const category = categories.find(
      (cat: CategoryProps) => cat.id === product.categoryId
    ).name;
    return { ...product, category: category };
  });

  return { data: productsWithCategories, error: "" };
}

export async function getProductBoughtByIdAction(id: string) {
  const supabase = await createClient();
  const { data: productsBought, error } = await supabase
    .from("productsBought")
    .select("*,productsRestockingBills(totalPrice)")
    .eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: productsBought[0], error: "" };
}

async function updateProductsStock(
  { id, stock }: { id: number; stock: number },
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from("product")
    .update({ stock: stock })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

type BoughtProducts = z.infer<typeof ProductBoughtSchema> & {
  newStockNum: number;
};
export async function createProductBoughtBulkAction({
  reStockingBillId,
  data,
  shopName,
  totalPrice,
  stocksToUpdate,
}: {
  reStockingBillId: number | null;
  data: z.infer<typeof ProductBoughtSchema>[];
  shopName: string;
  totalPrice: number;
  stocksToUpdate: { id: number; stock: number }[];
}) {
  try {
    let shopNameId: number | null = null;
    if (!reStockingBillId) {
      const { data, error } = await createRestockingBillAction({
        shopName,
        totalPrice,
      });

      if (error) throw new Error(error.message);

      if (data) shopNameId = data[0].id;
    }

    const productsBoughtArr = data.map((product) => {
      return {
        ...product,
        totalPriceAfterDiscount:
          (product.pricePerUnit - product.discount) * product.count,
        productsRestockingBillId: reStockingBillId
          ? reStockingBillId
          : shopNameId,
      };
    });

    // Get the supabase client.
    const supabase = await createClient();

    // Create the new inventory.
    const { error } = await supabase
      .from("productsBought")
      .insert(productsBoughtArr);

    if (error) {
      throw new Error(error.message);
    }

    // Update the products stocks after creating the new inventory.
    const stocks = stocksToUpdate.map((stock) => {
      return updateProductsStock(stock, supabase);
    });
    const results = await Promise.allSettled(stocks);
    results.forEach((result) => {
      if (result.status === "rejected") {
        throw new Error(
          "Somthing went wrong while updating the product stock numbers."
        );
      }
    });

    // revalidateTag("productBought");
    revalidatePath("/dashboard/inventory");

    return { data: null, error: "" };
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message };
    }
    return { data: null, error: "Failed to create an inventory entry." };
  }
}

interface EditProps {
  pricePerUnit: number;
  discount: number;
  count: number;
  isReturned: boolean;
  note: string;
  productId: number;
  newStockNum: number;
  productsRestockingBillId: number;
  id: number;
}

export async function editProductBoughtAction(
  {
    pricePerUnit,
    discount,
    count,
    isReturned,
    note,
    productId,
    newStockNum,
    productsRestockingBillId,
    id,
  }: EditProps,
  newTotal: number
) {
  try {
    const totalPriceAfterDiscount = (pricePerUnit - discount) * count;
    const supabase = await createClient();

    const { error } = await supabase
      .from("productsBought")
      .update({
        pricePerUnit,
        discount,
        count,
        isReturned,
        note,
        totalPriceAfterDiscount,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    const { error: BillError } = await supabase
      .from("productsRestockingBills")
      .update({ totalPrice: newTotal })
      .eq("id", productsRestockingBillId);

    if (BillError) throw new Error(BillError.message);

    await updateProductsStock({ id: productId, stock: newStockNum }, supabase);

    // revalidateTag("productBought");
    // revalidateTag("restockingBills");
    // revalidateTag("products");
    revalidatePath("/dashboard/inventory");
    return { data: null, error: "" };
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message };
    }
    return { data: null, error: "Failed to edit inventory item data." };
  }
}

export async function deleteProductsBoughtByIdAction(
  id: number,
  totalPrice: number,
  billId: number,
  newStockObj: { id: number; stock: number }
) {
  //Product?PageNumber=1&PageSize=10
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("productsBought")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    const { error: billError } = await editRestockingBillAction({
      restockingToEdit: { totalPrice },
      id: billId,
    });
    if (billError) throw new Error(billError);

    await updateProductsStock(newStockObj, supabase);

    // revalidatePath("/restockingBills");

    revalidatePath("/dashboard/inventory");
    return { data: null, error: "" };
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message };
    }
    return { data: null, error };
  }
}

interface GetProdcutsCountActionProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
}

export async function getProductsCountAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
}: GetProdcutsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return {
  //     data: null,
  //     error: "You are not authorized to get the products count data.",
  //   };

  let query = `${process.env.API_URL}/api/Product/count?`;

  if (name) query = query + `&Name=${name}`;

  if (categoryId) query = query + `&CategoryId=${categoryId}`;

  if (productTypeId) query = query + `&ProductTypeId=${productTypeId}`;

  if (productBrandId) query = query + `&ProductBrandId=${productBrandId}`;

  if (isAvailable) query = query + `&IsAvailable=${isAvailable}`;

  const response = await fetch(query, {
    method: "GET",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    //   // "Content-type": "application/json",
    // },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products count.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products count.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

/// PRODUCT IMAGES.

export async function getProductsImageAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      //   // "Content-type": "application/json",
      // },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductImageAction(formData: FormData) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/ProductImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return {
      data: null,
      error: "Something went wrong while creating a product.",
    };
  }

  return { data: null, error: "" };
}

export async function deleteProductsImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  return { data: null, error: "" };
}

/// WTF IS THIS ?

export async function getProductsImagesMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function setProductImageAsMain(id: number) {
  const token = getToken();

  if (!token) redirect("/login");

  await fetch(`${process.env.API_URL}/api/ProductImages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  }).then(async (response) => {
    if (!response.ok) {
      if (response.status === 409) {
        return { data: null, error: (await response.json()).message };
      }

      return {
        data: null,
        error: "Something went wrong while grabbing the products.",
      };
    }
  });

  return { data: null, error: "" };
}

export async function deleteProductsImageMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

/*

"use server";

import { AUTH_TOEKN_NAME, PAGE_SIZE } from "@lib/constants";
import { getAllCategories } from "@lib/data-service";
import { getToken } from "@lib/helper";
import {
  Category,
  CreateProductBought,
  CreateProductProps,
  EditProduct,
  Product,
  ProductBoughtSchema,
  ProductImage,
} from "@lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createRestockingBillAction } from "./restockingBillActions";

interface GetProdcutsBoughtActionProps {
  pageNumber?: string;
  name?: string;
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}

export async function getProductsBoughtAction({
  pageNumber,
  name,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: GetProdcutsBoughtActionProps) {
  //Product?PageNumber=1&PageSize=10
  // /api/Product?Name=test&CategoryId=1&ProductTypeId=1&ProductBrandId=1&IsAvailable=true&PageNumber=1&PageSize=10
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/ProductBought?&PageSize=${PAGE_SIZE}`;

  if (name) query = query + `&Name=${name}`;
  if (pageNumber) query = query + `&PageNumber=${pageNumber}`;

  if (dateOfOrderFrom) query = query + `&dateOfOrderFrom=${dateOfOrderFrom}`;

  if (dateOfOrderTo) query = query + `&dateOfOrderTo=${dateOfOrderTo}`;

  if (minTotalPrice) query = query + `&minTotalPrice=${minTotalPrice}`;

  if (maxTotalPrice) query = query + `&maxTotalPrice=${maxTotalPrice}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    next: {
      // revalidate: 3600,
      tags: [
        "productsBought",
        // `${pageNumber}`,
        // `${name}`,
        // `${categoryId}`,
        // `${productTypeId}`,
        // `${productBrandId}`,
        // `${isAvailable}`,
      ],
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const categories = await getAllCategories();

  const data = (await response.json()) as Product[];

  const productsWithCategories = data.map((product) => {
    const category = categories.find(
      (cat: Category) => cat.id === product.categoryId
    ).name;
    return { ...product, category: category };
  });

  return { data: productsWithCategories, error: "" };
}

export async function getProductBoughtByIdAction(id: string) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductsBought/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductBoughtBulkAction({
  reStockingBillId,
  data,
  shopName,
}: {
  reStockingBillId: number | null;
  data: z.infer<typeof ProductBoughtSchema>[];
  shopName: string;
}) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  let shopNameId: number | null = null;
  if (!reStockingBillId) {
    const res = await createRestockingBillAction(shopName);
    shopNameId = res.data.id;
  }

  const productsBoughtArr = data.map((product) => {
    return {
      ...product,
      productsRestockingBillId: reStockingBillId
        ? reStockingBillId
        : shopNameId,
    };
  });

  const response = await fetch(
    `${process.env.API_URL}/api/ProductsBought/bulk`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productsBoughtArr),
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return {
      data: null,
      error: "Something went wrong while creating a product.",
    };
  }

  //   const { prodcutId } = await response.json();

  revalidateTag("productBought");

  return { data: null, error: "" };
}

interface EditProps {
  pricePerUnit: number;
  discount: number;
  count: number;
  isReturned: boolean;
  note: string;
  id: number;
}

export async function editProductBoughtAction({
  pricePerUnit,
  discount,
  count,
  isReturned,
  note,
  id,
}: EditProps) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductsBought/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pricePerUnit, discount, count, isReturned, note }),
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return {
      data: null,
      error: "Something went wrong while editing a product.",
    };
  }

  revalidateTag("productBought");
  revalidateTag("restockingBills");

  return { data: null, error: "" };
}

export async function deleteProductsBoughtByIdAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductsBought/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return {
      data: null,
      error: `Failed to delete a product from the inventory with the id of ${id}`,
    };
  }
  // const data = await response.json();

  // return data;
  revalidatePath("/restockingBills");

  return { data: null, error: "" };
}

interface GetProdcutsCountActionProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
}

export async function getProductsCountAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
}: GetProdcutsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return {
  //     data: null,
  //     error: "You are not authorized to get the products count data.",
  //   };

  let query = `${process.env.API_URL}/api/Product/count?`;

  if (name) query = query + `&Name=${name}`;

  if (categoryId) query = query + `&CategoryId=${categoryId}`;

  if (productTypeId) query = query + `&ProductTypeId=${productTypeId}`;

  if (productBrandId) query = query + `&ProductBrandId=${productBrandId}`;

  if (isAvailable) query = query + `&IsAvailable=${isAvailable}`;

  const response = await fetch(query, {
    method: "GET",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    //   // "Content-type": "application/json",
    // },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products count.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products count.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

/// PRODUCT IMAGES.

export async function getProductsImageAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      //   // "Content-type": "application/json",
      // },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductImageAction(formData: FormData) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/ProductImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return {
      data: null,
      error: "Something went wrong while creating a product.",
    };
  }

  return { data: null, error: "" };
}

export async function deleteProductsImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  return { data: null, error: "" };
}

/// WTF IS THIS ?

export async function getProductsImagesMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function setProductImageAsMain(id: number) {
  const token = getToken();

  if (!token) redirect("/login");

  await fetch(`${process.env.API_URL}/api/ProductImages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  }).then(async (response) => {
    if (!response.ok) {
      if (response.status === 409) {
        return { data: null, error: (await response.json()).message };
      }

      return {
        data: null,
        error: "Something went wrong while grabbing the products.",
      };
    }
  });

  return { data: null, error: "" };
}

export async function deleteProductsImageMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}
*/
