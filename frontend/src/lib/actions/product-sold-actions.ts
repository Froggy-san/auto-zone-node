"use server";

import { PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import {
  EditServiceFee,
  Product,
  ProductSold,
  ProductToSell,
  ProductWithCategory,
} from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { editServiceAction } from "./serviceActions";
import {
  adjustProductsStockAction,
  editProductAction,
  editProductsStockAction,
} from "./productsActions";

interface GetProps {
  pageNumber?: string;
  price?: string;
  discount?: string;
  isReturned?: string;
  notes?: string;
  categoryId?: string;
  serviceId?: string;
}

export async function getServiceFeesAction({
  pageNumber,
  price,
  discount,
  isReturned,
  notes,
  categoryId,
  serviceId,
}: GetProps) {
  //   await new Promise((res) => setTimeout(res, 9000));
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  let query = `${process.env.API_URL}/api/ServicesFee?&PageSize=${PAGE_SIZE}`;

  if (pageNumber) query = query + `&PageNumber=${pageNumber}`;

  if (price) query = query + `&price=${price}`;

  if (discount) query = query + `&discount=${discount}`;

  if (isReturned) query = query + `&isReturned=${isReturned}`;

  if (notes) query = query + `&notes=${notes}`;

  if (categoryId) query = query + `&categoryId=${categoryId}`;

  if (serviceId) query = query + `&serviceId=${serviceId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["services"],
    },
  });

  if (!response.ok) {
    console.log(
      "Something went wrong while trying to fetch Service fees data.",
    );
    return {
      data: null,
      error: "Something went wrong while trying to fetch Service fees data.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// The service fees are created in the service actions.

type CreateProps = ProductSold & { totalPriceAfterDiscount: number };
export async function createProductToSellAction(
  productToSell: CreateProps,
  totalPrice: number,
) {
  try {
    const supabase = await createClient();
    // 1. Add new product sold.
    const { error } = await supabase
      .from("productsToSell")
      .insert([productToSell]);
    if (error) throw new Error(error.message);

    // 2. Update the total price after discound of the related service.
    const { data, error: serviceError } = await editServiceAction({
      id: productToSell.serviceId,
      totalPrice,
    });

    // 3. Update the number of stocks available for the product sold.

    const { error: adjustError } = await adjustProductsStockAction(
      "decrement",
      [{ id: productToSell.productId, quantity: productToSell.count }],
    );
    // const update = productToSell.
    // const stockError = await editProductsStockAction([stocksUpdates]);
    if (adjustError) return { data, error: adjustError };
    if (serviceError) return { data, error: serviceError };

    revalidateTag("services");

    return { data: null, error: "" };
  } catch (error: any) {
    console.log(`Failed to create product sold entry: ${error.message}`);
    return { data: null, error: error.message };
  }
}

export async function getProductToSellById(
  id: string,
): Promise<{ data: ProductToSell | null; error: string }> {
  const supabase = await createClient();
  const { data: productsToSell, error } = await supabase
    .from("productsToSell")
    .select("*,product(*)")
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  if (!productsToSell)
    return { data: null, error: `Couldn't find product sold data '${id}'` };
  return { data: productsToSell[0], error: "" };
}
// export async function getProductToSellById(id: string) {
//   const token = getToken();
//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };
//   const response = await fetch(
//     `${process.env.API_URL}/api/ProductsToSell/${id}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//     }
//   );
//   if (!response.ok) {
//     console.log("Something went wrong while deleting the a restocking bill.");
//     return { data: null, error: "Something went wrong!" };
//   }

//   const data = await response.json();

//   return { data: data, error: "" };
// }

interface EditProps {
  pricePerUnit: number;
  discount: number;
  count: number;
  isReturned: boolean;
  note: string;
  totalPriceAfterDiscount: number;
}

interface ServiceProps {
  id: number;
  totalPrice: number;
  isEqual: boolean;
}
export async function editProductToSellAction(
  {
    productToSell,
    id,
  }: {
    productToSell: EditProps;
    id: number;
  },
  { id: serviceId, totalPrice, isEqual }: ServiceProps,
  stocksUpdates: Product,
) {
  const supabase = await createClient();

  // 1. Update the product sold entry.
  const { error } = await supabase
    .from("productsToSell")
    .update(productToSell)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  // 2. Update the total service price after discount for the related song.
  if (!isEqual) {
    const { data, error } = await editServiceAction({
      id: serviceId,
      totalPrice,
    });
    if (error) return { data, error };
  }

  // 3. Update the stock availbe for the related product sold.
  const stockError = await editProductsStockAction([stocksUpdates]);
  if (stockError) return { data: null, error: stockError };
  revalidatePath(`/products/${stocksUpdates.id}`);
  revalidateTag("services");

  return { data: null, error: "" };
}

interface Delete {
  proSold: ProductToSell;
  serviceId: number;
  totalPrice: number;
  shouldUpdateStock?: boolean;
}

export async function deleteProductToSellAction({
  proSold,
  serviceId,
  totalPrice,
  shouldUpdateStock = false,
}: Delete) {
  try {
    const supabase = await createClient();

    // 1. Delete the product sold entry.
    const { error } = await supabase
      .from("productsToSell")
      .delete()
      .eq("id", proSold.id);

    if (error)
      throw new Error(`Failed to delete product sold: ${error.message}`);

    const { data, error: serviceError } = await editServiceAction({
      id: serviceId,
      totalPrice,
    });
    if (serviceError) throw new Error(serviceError);

    // 2. If the user wants to update the stock of the product after deleting the product sold entry.
    if (shouldUpdateStock) {
      const { error } = await adjustProductsStockAction("increment", [
        { id: proSold.productId, quantity: proSold.count },
      ]);

      if (error) throw new Error(error);
    }
    revalidateTag("services");

    return { data: null, error: "" };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error.message };
  }
}

export async function getServiceFeesCountAction({
  price,
  discount,
  isReturned,
  notes,
  categoryId,
  serviceId,
}: {
  price?: string;
  discount?: string;
  isReturned?: string;
  notes?: string;
  categoryId?: string;
  serviceId?: string;
}) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  let query = `${process.env.API_URL}/api/ServicesFee?&PageSize=${PAGE_SIZE}`;

  if (price) query = query + `&price=${price}`;

  if (discount) query = query + `&discount=${discount}`;

  if (isReturned) query = query + `&isReturned=${isReturned}`;

  if (notes) query = query + `&notes=${notes}`;

  if (categoryId) query = query + `&categoryId=${categoryId}`;

  if (serviceId) query = query + `&serviceId=${serviceId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while trying to fetch Services count.");
    return {
      data: null,
      error: "Something went wrong while trying to fetch Services count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

/*

"use server";

import { PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { EditServiceFee, ProductSold, ProductToSell } from "@lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

interface GetProps {
  pageNumber?: string;
  price?: string;
  discount?: string;
  isReturned?: string;
  notes?: string;
  categoryId?: string;
  serviceId?: string;
}

export async function getServiceFeesAction({
  pageNumber,
  price,
  discount,
  isReturned,
  notes,
  categoryId,
  serviceId,
}: GetProps) {
  //   await new Promise((res) => setTimeout(res, 9000));
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  let query = `${process.env.API_URL}/api/ServicesFee?&PageSize=${PAGE_SIZE}`;

  if (pageNumber) query = query + `&PageNumber=${pageNumber}`;

  if (price) query = query + `&price=${price}`;

  if (discount) query = query + `&discount=${discount}`;

  if (isReturned) query = query + `&isReturned=${isReturned}`;

  if (notes) query = query + `&notes=${notes}`;

  if (categoryId) query = query + `&categoryId=${categoryId}`;

  if (serviceId) query = query + `&serviceId=${serviceId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["services"],
    },
  });

  if (!response.ok) {
    console.log(
      "Something went wrong while trying to fetch Service fees data."
    );
    return {
      data: null,
      error: "Something went wrong while trying to fetch Service fees data.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// The service fees are created in the service actions.

export async function createProductToSellAction(productToSell: ProductSold) {
  const token = getToken();
  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/ProductsToSell`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(productToSell),
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while creating the a restocking bill.");
    return { data: null, error: "Something went wrong!" };
  }

  //   revalidatePath("/dashboard/insert-data");
  revalidateTag("services");

  // const data = await response.json();
  // return data;

  return { data: null, error: "" };
}

export async function getProductToSellById(id: string) {
  const token = getToken();
  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(
    `${process.env.API_URL}/api/ProductsToSell/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    }
  );
  if (!response.ok) {
    console.log("Something went wrong while deleting the a restocking bill.");
    return { data: null, error: "Something went wrong!" };
  }

  const data = await response.json();

  return { data: data, error: "" };
}

interface EditProps {
  pricePerUnit: number;
  discount: number;
  count: number;
  isReturned: boolean;
  note: string;
}

export async function editProductToSellAction({
  productToSell,
  id,
}: {
  productToSell: EditProps;
  id: number;
}) {
  const token = getToken();
  if (!token) {
    return redirect("/login");
    // throw new Error("You are not Authorized to make this action.");
  }
  const response = await fetch(
    `${process.env.API_URL}/api/ProductsToSell/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify(productToSell),
    }
  );
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while editing the service fee.");
    return { data: null, error: "Something went wrong!" };
  }

  revalidateTag("services");
  // const data = await response.json();
  // return data;

  return { data: null, error: "" };
}

export async function deleteProductToSellAction(id: string) {
  const token = getToken();
  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductsToSell/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    }
  );
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while deleting the a restocking bill.");
    return { data: null, error: "Something went wrong!" };
  }
  revalidateTag("services");

  return { data: null, error: "" };
}

export async function getServiceFeesCountAction({
  price,
  discount,
  isReturned,
  notes,
  categoryId,
  serviceId,
}: {
  price?: string;
  discount?: string;
  isReturned?: string;
  notes?: string;
  categoryId?: string;
  serviceId?: string;
}) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  let query = `${process.env.API_URL}/api/ServicesFee?&PageSize=${PAGE_SIZE}`;

  if (price) query = query + `&price=${price}`;

  if (discount) query = query + `&discount=${discount}`;

  if (isReturned) query = query + `&isReturned=${isReturned}`;

  if (notes) query = query + `&notes=${notes}`;

  if (categoryId) query = query + `&categoryId=${categoryId}`;

  if (serviceId) query = query + `&serviceId=${serviceId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while trying to fetch Services count.");
    return {
      data: null,
      error: "Something went wrong while trying to fetch Services count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}
*/
