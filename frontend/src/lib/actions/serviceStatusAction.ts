"use server";

import { PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { ServiceStatus, ServiceStatusForm } from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface GetRestockingProps {
  pageNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  carId?: string;
  serviceStatusId?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface servicesReturns {
  data: ServiceStatus[] | null;
  error: string;
}

export async function getServiceStatusAction(): Promise<servicesReturns> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/serviceStatuses?select=*&order=created_at.asc`,
      {
        method: "GET",
        headers: {
          apikey: `${supabaseKey}`,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: {
          tags: ["serviceStatus"],
        },
      },
    );

    if (!response.ok) {
      const error =
        (await response.json()).message ||
        "Something went wrong while trying to fetch services status data.";

      throw new Error(error);
      console.log(error);
    }

    const data = await response.json();
    return { data, error: "" };
  } catch (error: any) {
    console.log(`Failed to get serivce statuses: ${error.message}`);
    return { data: null, error: error.message };
  }
}

interface ServiceStatusProps {
  colorLight: string;
  colorDark: string;
  name: string;
  description: string;
}

export async function createStatus(formData: ServiceStatusProps) {
  const supabase = await createClient();
  const { error } = await supabase.from("serviceStatuses").insert([formData]);

  if (error) {
    console.log(error.message);
    return { data: null, error: error.message };
  }

  //   revalidatePath("/dashboard/insert-data");
  revalidateTag("serviceStatus");
  return { data: null, error: "" };
}

interface EditProps {
  statusToEdit: ServiceStatusProps;
  id: number;
}

export async function editServiceStatus({ statusToEdit, id }: EditProps) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("serviceStatuses")
    .update(statusToEdit)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  revalidateTag("serviceStatus");
  // const data = await response.json();
  // return data;

  return { data: null, error: "" };
}

export async function deleteServiceStatus(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("serviceStatuses")
    .delete()
    .eq("id", id);

  if (error) return { data: null, error: error.message };
  revalidateTag("serviceStatus");

  return { data: null, error: "" };
}

export async function getServicesCountAction({
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

  let query = `${process.env.API_URL}/api/Services/count?`;

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
    console.log("Something went wrong while trying to fetch Services count.");
    return {
      data: null,
      error: "Something went wrong while trying to fetch Services count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// 00000000000000000000

// "use server";

// import { PAGE_SIZE } from "@lib/constants";
// import { getToken } from "@lib/helper";
// import { ServiceStatus, ServiceStatusForm } from "@lib/types";
// import { revalidatePath, revalidateTag } from "next/cache";
// import { redirect } from "next/navigation";

// interface GetRestockingProps {
//   pageNumber?: string;
//   dateFrom?: string;
//   dateTo?: string;
//   clientId?: string;
//   carId?: string;
//   serviceStatusId?: string;
//   minPrice?: string;
//   maxPrice?: string;
// }

// interface servicesReturns {
//   data: ServiceStatus[] | null;
//   error: string;
// }

// export async function getServiceStatusAction(): Promise<servicesReturns> {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };

//   const response = await fetch(`${process.env.API_URL}/api/ServiceStatuses`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     next: {
//       tags: ["serviceStatus"],
//     },
//   });

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch services status data."
//     );
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch services data.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }

// interface ServiceStatusProps {
//   colorLight: string;
//   colorDark: string;
//   name: string;
//   description: string;
// }

// export async function createStatus(formData: ServiceStatusProps) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(`${process.env.API_URL}/api/ServiceStatuses`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-type": "application/json",
//     },
//     body: JSON.stringify(formData),
//   });

//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }

//     return {
//       data: null,
//       error: "Something went wrong while creating a new service status.",
//     };
//   }

//   //   revalidatePath("/dashboard/insert-data");
//   revalidateTag("serviceStatus");

//   const data = await response.json();
//   return { data, error: "" };
// }

// interface EditProps {
//   statusToEdit: ServiceStatusProps;
//   id: number;
// }

// export async function editServiceStatus({ statusToEdit, id }: EditProps) {
//   const token = getToken();

//   if (!token) redirect("/login");

//   const response = await fetch(
//     `${process.env.API_URL}/api/ServiceStatuses/${id}?description=${
//       statusToEdit.description || ""
//     }&colorLight=${statusToEdit.colorLight}&colorDark=${
//       statusToEdit.colorDark
//     }&name=${statusToEdit.name}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }

//     return {
//       data: null,
//       error: "Something went wrong while editing service status.",
//     };
//   }

//   revalidateTag("serviceStatus");
//   // const data = await response.json();
//   // return data;

//   return { data: null, error: "" };
// }

// export async function deleteServiceStatus(id: number) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/ServiceStatuses/${id}`,
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

//     return { data: null, error: "Failed to delete service status." };
//   }
//   revalidateTag("serviceStatus");

//   return { data: null, error: "" };
// }

// export async function getServicesCountAction({
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

//   let query = `${process.env.API_URL}/api/Services/count?`;

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
//     console.log("Something went wrong while trying to fetch Services count.");
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch Services count.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }
