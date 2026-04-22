"use server";

import { PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { createClient } from "@utils/supabase/server";
import { revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface GetRestockingProps {
  pageNumber?: string;
  name?: string;
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}

export async function getRestockingBillsAction({
  pageNumber,
  name,
  shopName,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: GetRestockingProps) {
  const from = (Number(pageNumber) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = `${supabaseUrl}/rest/v1/productsRestockingBills?select=*,productsBought(*,product(*))&order=created_at.desc&productsBought.order=created_at.asc`;

  if (shopName) query = query + `&shopName=ilike.*${shopName}*`;
  if (name) {
    const escapedName = name.replace(/[%_]/g, "\\$&"); // Escaping % and _
    query += `&productsBought.product.name=ilike.*${escapedName}*`;
  }

  if (dateOfOrderFrom)
    query += `&created_at=gte.${new Date(dateOfOrderFrom).toISOString()}`;

  if (dateOfOrderTo) {
    /// If the user selects the 'Date to' at the same date of the 'Date from' and then turn them into ISOString, it will convert the 2 dates and add the time to them set to be in the begging of the day down to the seconds, i think, so to find matching data like that is very unlikely, so in order to avoid this we will set the time in  the 'Date to' to the end of the day, that way the 2 dates don't match down to the last second.
    const dateToEndOfDay = new Date(dateOfOrderTo);
    dateToEndOfDay.setHours(23, 59, 59, 999); // Setting time to end of the day
    query += `&created_at=lte.${dateToEndOfDay.toISOString()}`;
  }

  if (minTotalPrice) query = query + `&totalPrice=gte.${minTotalPrice}`;

  if (maxTotalPrice) query = query + `&totalPrice=lte.${maxTotalPrice}`;

  const headers = {
    apikey: `${supabaseKey}`,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: "count=exact",
  } as Record<string, string>;

  if (pageNumber) {
    headers.Range = `${from}-${to}`;
  }

  const response = await fetch(query, {
    method: "GET",
    headers,
    next: {
      tags: ["restockingBills"],
    },
  });

  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Something went wrong while trying to fetch ProductsRestockingBills data.";

    console.log(error.message);
    return {
      data: null,
      error,
    };
  }
  const count = response.headers.get("content-range")?.split("/")[1] || 0;
  const data = await response.json();
  return { data: { data, count }, error: "" };
}

interface CreateProps {
  shopName: string;
  totalPrice: number;
}
export async function createRestockingBillAction(billData: CreateProps) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productsRestockingBills")
    .insert([billData])
    .select();

  revalidateTag("restockingBills");

  return { data, error };
}

interface EditProps {
  restockingToEdit: {
    shopName?: string;
    created_at?: Date;
    totalPrice?: number;
  };
  id: number;
}

export async function editRestockingBillAction({
  restockingToEdit,
  id,
}: EditProps) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productsRestockingBills")
    .update(restockingToEdit)
    .eq("id", id);

  if (error) return { data: null, error: error.message };
  revalidateTag("restockingBills");
  // const data = await response.json();
  // return data;

  return { data: null, error: "" };
}

export async function deleteRestockingBillAction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productsRestockingBills")
    .delete()
    .eq("id", id);
  if (error) return { data: null, error: error.message };
  revalidateTag("restockingBills");

  return { data: null, error: "" };
}

export async function getProductsRestockingBillsCountAction({
  shopName,
  dateOfOrderFrom,
  dateOfOrderTo,
  maxTotalPrice,
  minTotalPrice,
}: {
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/ProductsRestockingBills/count?`;

  if (shopName) query = query + `&shopName=${shopName}`;

  if (dateOfOrderFrom) query = query + `&dateOfOrderFrom=${dateOfOrderFrom}`;

  if (dateOfOrderTo) query = query + `&dateOfOrderTo=${dateOfOrderTo}`;

  if (minTotalPrice) query = query + `&minTotalPrice=${minTotalPrice}`;

  if (maxTotalPrice) query = query + `&maxTotalPrice=${maxTotalPrice}`;
  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.log(
      "Something went wrong while trying to fetch ProductsRestockingBills count."
    );
    return {
      data: null,
      error:
        "Something went wrong while trying to fetch ProductsRestockingBills count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// --------------

// interface GetRestockingProps {
//   pageNumber?: string;
//   name?: string;
//   shopName?: string;
//   dateOfOrderFrom?: string;
//   dateOfOrderTo?: string;
//   minTotalPrice?: string;
//   maxTotalPrice?: string;
// }

// export async function getRestockingBillsAction({
//   pageNumber,
//   name,
//   shopName,
//   dateOfOrderFrom,
//   dateOfOrderTo,
//   minTotalPrice,
//   maxTotalPrice,
// }: GetRestockingProps) {
//   await new Promise((res) => setTimeout(res, 9000));
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };
//   let query = `${process.env.API_URL}/api/ProductsRestockingBills?&PageSize=${PAGE_SIZE}`;

//   if (pageNumber) query = query + `&PageNumber=${pageNumber}`;

//   if (shopName) query = query + `&shopName=${shopName}`;

//   if (dateOfOrderFrom) query = query + `&dateOfOrderFrom=${dateOfOrderFrom}`;

//   if (dateOfOrderTo) query = query + `&dateOfOrderTo=${dateOfOrderTo}`;

//   if (minTotalPrice) query = query + `&minTotalPrice=${minTotalPrice}`;

//   if (maxTotalPrice) query = query + `&maxTotalPrice=${maxTotalPrice}`;

//   const response = await fetch(query, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     next: {
//       tags: ["restockingBills"],
//     },
//   });

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch ProductsRestockingBills data."
//     );
//     return {
//       data: null,
//       error:
//         "Something went wrong while trying to fetch ProductsRestockingBills data.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }

// export async function createRestockingBillAction(shopName: string) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/ProductsRestockingBills`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ shopName }),
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while creating the a restocking bill.");
//     return { data: null, error: "Something went wrong!" };
//   }

//   //   revalidatePath("/dashboard/insert-data");

//   const data = await response.json();
//   revalidateTag("restockingBills");

//   return { data, error: "" };
// }

// interface EditProps {
//   restockingToEdit: { shopName: string; dateOfOrder: string };
//   id: string;
// }

// export async function editRestockingBillAction({
//   restockingToEdit,
//   id,
// }: EditProps) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/ProductsRestockingBills/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(restockingToEdit),
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while creating the a restocking bill.");
//     return { data: null, error: "Something went wrong!" };
//   }

//   revalidateTag("restockingBills");
//   // const data = await response.json();
//   // return data;

//   return { data: null, error: "" };
// }

// export async function deleteRestockingBillAction(id: string) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/ProductsRestockingBills/${id}`,
//     {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while deleting the a restocking bill.");
//     return { data: null, error: "Something went wrong!" };
//   }
//   revalidateTag("restockingBills");
//   // const data = await response.json();
//   // return data;

//   return { data: null, error: "" };
// }

// export async function getProductsRestockingBillsCountAction({
//   shopName,
//   dateOfOrderFrom,
//   dateOfOrderTo,
//   maxTotalPrice,
//   minTotalPrice,
// }: {
//   shopName?: string;
//   dateOfOrderFrom?: string;
//   dateOfOrderTo?: string;
//   minTotalPrice?: string;
//   maxTotalPrice?: string;
// }) {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };

//   let query = `${process.env.API_URL}/api/ProductsRestockingBills/count?`;

//   if (shopName) query = query + `&shopName=${shopName}`;

//   if (dateOfOrderFrom) query = query + `&dateOfOrderFrom=${dateOfOrderFrom}`;

//   if (dateOfOrderTo) query = query + `&dateOfOrderTo=${dateOfOrderTo}`;

//   if (minTotalPrice) query = query + `&minTotalPrice=${minTotalPrice}`;

//   if (maxTotalPrice) query = query + `&maxTotalPrice=${maxTotalPrice}`;
//   const response = await fetch(query, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch ProductsRestockingBills count."
//     );
//     return {
//       data: null,
//       error:
//         "Something went wrong while trying to fetch ProductsRestockingBills count.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }
