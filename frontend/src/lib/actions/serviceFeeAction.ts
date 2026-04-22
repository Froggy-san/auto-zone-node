"use server";

import { PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { EditServiceFee } from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { editServiceAction } from "./serviceActions";

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

interface CreateProps {
  categoryId: number;
  price: number;
  discount: number;
  notes: string;
  serviceId: number;
  totalPriceAfterDiscount: number;
}

interface ServiceProps {
  id: number;
  totalPrice: number;
}

export async function createServiceFeeAction(
  newFee: CreateProps,
  serviceTotal: ServiceProps
) {
  const supabase = await createClient();
  const { error } = await supabase.from("servicesFee").insert([newFee]);

  if (error) return { data: null, error: error.message };
  //   revalidatePath("/dashboard/insert-data");

  const { data, error: serviceError } = await editServiceAction(serviceTotal);
  if (error) return { data, error: serviceError };

  revalidateTag("services");

  return { data: null, error: "" };
}

export async function getServiceFeesById(id: string) {
  const supabase = await createClient();
  const { data: servicesFee, error } = await supabase
    .from("servicesFee")
    .select("*")
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  if (!servicesFee)
    return {
      data: servicesFee,
      error: `Failed to get the service fee data ${id}`,
    };

  return { data: servicesFee[0], error: "" };
}

type EditProps = EditServiceFee & {
  totalPriceAfterDiscount: number;
};

interface serviceTotalProps {
  id: number;
  totalPrice: number;
  isEqual: boolean;
}
export async function editServiceFeeAction(
  {
    serviceFee,
    id,
  }: {
    serviceFee: EditProps;
    id: number;
  },
  { id: serviceId, totalPrice, isEqual }: serviceTotalProps
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("servicesFee")
    .update(serviceFee)
    .eq("id", id);
  if (error) return { data: null, error: error.message };

  if (!isEqual) {
    console.log("<<<<<<<<<");
    const { data, error } = await editServiceAction({
      id: serviceId,
      totalPrice,
    });
    if (error) return { data, error };
  }
  revalidateTag("services");

  return { data: null, error: "" };
}

export async function deleteServiceFeeAction(
  id: string,
  total: number,
  serviceId: number
) {
  const supabase = await createClient();
  const { error } = await supabase.from("servicesFee").delete().eq("id", id);

  if (error) return { data: null, error: error.message };

  const { data, error: serviceError } = await editServiceAction({
    totalPrice: total,
    id: serviceId,
  });

  if (serviceError) return { data: null, error: serviceError };
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

/*

"use server";

import { PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { EditServiceFee } from "@lib/types";
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

interface CreateProps {
  categoryId: number;
  price: number;
  discount: number;
  notes: string;
  serviceId: number;
}

export async function createServiceFeeAction(newFee: CreateProps) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/ServicesFee`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(newFee),
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

  return { data: null, error: "" };
}

export async function getServiceFeesById(id: string) {
  const token = getToken();
  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/ServicesFee/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
  });
  if (!response.ok) {
    console.log("Something went wrong while deleting the a restocking bill.");
    return { data: null, error: "Something went wrong!" };
  }

  const data = await response.json();

  return { data: data, error: "" };
}

export async function editServiceFeeAction({
  serviceFee,
  id,
}: {
  serviceFee: EditServiceFee;
  id: number;
}) {
  const token = getToken();
  if (!token) {
    return redirect("/login");

    // throw new Error("You are not Authorized to make this action.");
  }
  const response = await fetch(`${process.env.API_URL}/api/ServicesFee/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(serviceFee),
  });
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

export async function deleteServiceFeeAction(id: string) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/ServicesFee/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
  });
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
