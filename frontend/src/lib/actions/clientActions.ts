"use server";

import { AUTH_TOEKN_NAME, PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import {
  Client,
  ClientById,
  ClientWithPhoneNumbers,
  CreateClient,
  PhoneNumber,
} from "@lib/types";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { editPhoneNumAction } from "./phoneActions";
import { createClient } from "@utils/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface GetClientsActionProps {
  name?: string;
  email?: string;
  phone?: string;
  pageNumber?: string;
}

export async function getClientsAction({
  pageNumber,
  name,
  email,
  phone,
}: GetClientsActionProps): Promise<{
  data: { clients: ClientWithPhoneNumbers[]; count: number | string } | null;
  error: string;
}> {
  try {
    const from = (Number(pageNumber) - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = `${supabaseUrl}/rest/v1/clients?select=*,phones(*),cars(count)&order=created_at.asc&phones.order=created_at.asc`;

    if (name) query = query + `&name=ilike.*${name}*`;
    if (email) query = query + `&email=ilike.*${email}*`;
    if (phone) query = query + `&phones.number=eq.${phone}`;

    const headers = {
      apikey: `${supabaseKey}`,
      Authorization: `Bearer ${supabaseKey}`,
    } as Record<string, string>;

    if (pageNumber) {
      headers.Range = `${from}-${to}`;
      headers.Prefer = "count=exact";
    }

    const response = await fetch(query, {
      method: "GET",
      headers,
      next: {
        tags: ["clients"],
      },
    });

    if (!response.ok) {
      const error =
        (await response.json()).message || "Failed to get the clients data.";
      throw new Error(error);
    }
    const count = response.headers.get("content-range")?.split("/")[1] || 0;
    const data = (await response.json()) as ClientWithPhoneNumbers[];

    const clients = phone
      ? data.filter((client) => client.phones.length)
      : data;

    return { data: { clients, count }, error: "" };
  } catch (error: any) {
    console.log(`Failed to get the clietns: ${error.message}`);
    return { data: null, error: error.message };
  }
}

// export async function getClientsDataAction() {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };

//   const { data: phoneNumbers, error } = await getPhonesAction({});

//   const response = await fetch(`${process.env.API_URL}/api/Clients`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       // "Content-type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     return {
//       data: null,
//       error: "Something went wrong while grabbing the products.",
//     };
//   }

//   const data = (await response.json()) as Client[];

//   let ClientsData: ClientWithPhoneNumbers[] = [];

//   if (data.length) {
//     ClientsData = data.map((clientData) => {
//       const phoneNumbersData = phoneNumbers.filter(
//         (phone: PhoneNumber) => phone.clientId === clientData.id
//       );
//       return { ...clientData, phoneNumbers: phoneNumbersData };
//     });
//   }

//   return { data: ClientsData, error: "" };
// }

export async function getCurrentClientAction(): Promise<{
  data: Client | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    if (!user) throw new Error(`Failed to get the current user's data.`);

    const { data: clientById, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (clientError) throw new Error(clientError.message);

    if (!clientById)
      throw new Error(`Failed to get the currently logged in client.`);

    return { data: clientById, error: null };
  } catch (error: any) {
    console.log(`Failed to the currently logged in client.`);
    return { data: null, error: error.message };
  }
}
export async function getClientByIdAction(
  id: string,
  tag: "id" | "user_id",
): Promise<{ data: ClientById | null; error: string }> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/clients?${tag}=eq.${id}&select=*,phones(*),cars(*,carImages(*),carGenerations(*,carModels(*,carMakers(*))))&cars.carImages.order=created_at.asc`,
    {
      method: "GET",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
        // Prefer: "plurality=ignore", // The limit=1 makes this work
      },
    },
  );

  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Somthing went wrong whil getting the car data.";
    return {
      data: null,
      error,
    };
  }

  const data = (await response.json())[0];

  if (!data) return { data: null, error: "Something went wrong" };
  return { data: data, error: "" };
}

export async function createClientAction({
  name,
  email,
  phones,
  user_id,
  provider,
  picture,
}: CreateClient & {
  provider: string;
  user_id?: string;
  picture?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert([{ name, email, user_id, picture, provider }])
    .select();

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }
  const { id } = data?.[0];
  if (!data)
    return {
      data: null,
      error: "Something went wrong while creating a new client.",
    };
  if (phones.length) {
    // const upload = phones.map((phone) =>
    //   createPhoneNumAction({ number: phone.number, clientId })
    // );
    // try {
    //   await Promise.all(upload);
    // } catch (error: any) {
    //   if (error) return { data: null, error: error?.message };
    // }

    // Add the clientId to each phone number.

    const phonesToUpload = phones.map((phone) => {
      return { number: phone.number, clientId: id };
    });

    const { error: phoneError } = await supabase
      .from("phones")
      .insert(phonesToUpload);

    // Sent the phone numbers array to the back-end.

    // const { error } = await createPhoneNumsBulkAction(upload);
    // In case of an error, delete the client we created above.

    if (phoneError) {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      return {
        data: null,
        error: phoneError.message || error?.message,
      };
    }
  }
  revalidateTag("clients");

  return { data: null, error: "" };
}

export async function editClientAction({
  clientToEdit,
  phonesToEdit,
  phonesToAdd,
  phonesToDelete,
}: {
  phonesToEdit: PhoneNumber[];
  phonesToDelete: PhoneNumber[];
  clientToEdit: Client;
  phonesToAdd: { number: string }[];
}) {
  const supabase = await createClient();

  const { id, name, email } = clientToEdit;

  const { data, error } = await supabase
    .from("clients")
    .update({ name, email })
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  // Adding new phone numbers
  if (phonesToAdd.length) {
    const phones = phonesToAdd.map((phone) => {
      return { number: phone.number, clientId: id };
    });

    const { error: phoneError } = await supabase.from("phones").insert(phones);

    if (phoneError) return { data: null, error: phoneError.message };
  }

  // // Handling the editing of phone numbers
  if (phonesToEdit.length) {
    const editPhones = phonesToEdit.map((phone) =>
      editPhoneNumAction({ id: phone.id, number: phone.number }),
    );

    try {
      await Promise.all(editPhones);
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // // Handling the deleting of phone numbers.

  if (phonesToDelete.length) {
    const ids = phonesToDelete.map((phone) => phone.id);

    const { error } = await supabase.from("phones").delete().in("id", ids);

    if (error) return { data: null, error: error.message };
  }

  revalidateTag("clients");
  // revalidatePath("/dashboard/customers");

  return { data: null, error: "" };
}

export async function deleteClientByIdAction(id: number, revalidate = true) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { data: null, error: error.message };

  // return data;
  // revalidatePath("/products");
  if (revalidate) revalidateTag("clients");

  return { data: null, error: "" };
}

interface GetClientsCountActionProps {
  name?: string;
  email?: string;
  phone?: string;
}

export async function getClientsCountAction({
  name,
  email,
  phone,
}: GetClientsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return {
      data: null,
      error: "You are not authorized to get the products count data.",
    };

  let query = `${process.env.API_URL}/api/Clients/count?`;

  if (name) query = query + `&Name=${name}`;

  if (phone) query = query + `&phone=${phone}`;

  if (email) query = query + `&email=${email}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
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

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    },
  );

  if (!response.ok) {
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
      error: "Something went wrong while creating the product.",
    };
  }

  // const data = await response.json();
  // return data;

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
    },
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  // const data = await response.json();

  // return { data, error: "" };

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
    },
  );

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
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
    },
  );

  if (!response.ok) {
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
import { getToken } from "@lib/helper";
import {
  Client,
  ClientById,
  ClientWithPhoneNumbers,
  CreateClient,
  PhoneNumber,
} from "@lib/types";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createPhoneNumsBulkAction,
  deletePhoneNumByIdAction,
  editPhoneNumAction,
  getPhonesAction,
} from "./phoneActions";

interface GetClientsActionProps {
  name?: string;
  email?: string;
  phone?: string;
  pageNumber: string;
}

export async function getClientsAction({
  pageNumber,
  name,
  email,
  phone,
}: GetClientsActionProps) {
  //Product?PageNumber=1&PageSize=10
  // /api/Product?Name=test&CategoryId=1&ProductTypeId=1&ProductBrandId=1&IsAvailable=true&PageNumber=1&PageSize=10
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const { data: phoneNumbers, error } = await getPhonesAction({});

  let query = `${process.env.API_URL}/api/Clients?PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;

  if (name) query = query + `&Name=${name}`;

  if (email) query = query + `&Email=${email}`;

  if (phone) query = query + `&Phone=${phone}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
    next: {
      tags: ["clients"],
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = (await response.json()) as Client[];

  let ClientsData: ClientWithPhoneNumbers[] = [];

  if (data.length) {
    ClientsData = data.map((clientData) => {
      const phoneNumbersData = phoneNumbers.filter(
        (phone: PhoneNumber) => phone.clientId === clientData.id
      );
      return { ...clientData, phoneNumbers: phoneNumbersData };
    });
  }

  return { data: ClientsData, error: "" };
}

export async function getClientsDataAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const { data: phoneNumbers, error } = await getPhonesAction({});

  const response = await fetch(`${process.env.API_URL}/api/Clients`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = (await response.json()) as Client[];

  let ClientsData: ClientWithPhoneNumbers[] = [];

  if (data.length) {
    ClientsData = data.map((clientData) => {
      const phoneNumbersData = phoneNumbers.filter(
        (phone: PhoneNumber) => phone.clientId === clientData.id
      );
      return { ...clientData, phoneNumbers: phoneNumbersData };
    });
  }

  return { data: ClientsData, error: "" };
}

export async function getClienttByIdAction(id: number) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(`${process.env.API_URL}/api/Clients/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = (await response.json()) as ClientById;

  return { data, error: "" };
}

export async function createClientAction({
  name,
  email,
  phones,
}: CreateClient) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/Clients`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while creating the client.",
    };
  }
  const { clientId } = await response.json();

  if (phones.length) {
    // const upload = phones.map((phone) =>
    //   createPhoneNumAction({ number: phone.number, clientId })
    // );
    // try {
    //   await Promise.all(upload);
    // } catch (error: any) {
    //   if (error) return { data: null, error: error?.message };
    // }

    // Add the clientId to each phone number.

    const upload = phones.map((phone) => {
      return { number: phone.number, clientId };
    });

    // Sent the phone numbers array to the back-end.

    const { error } = await createPhoneNumsBulkAction(upload);
    // In case of an error, delete the client we created above.

    if (error) {
      const { error: deleteError } = await deleteClientByIdAction(
        clientId,
        false
      );

      return {
        data: null,
        error: `${error} ${deleteError && `& ${deleteError} `}`,
      };
    }
  }
  revalidateTag("clients");

  return { data: null, error: "" };
}

export async function editClientAction({
  clientToEdit,
  phonesToEdit,
  phonesToAdd,
  phonesToDelete,
}: {
  phonesToEdit: PhoneNumber[];
  phonesToDelete: PhoneNumber[];
  clientToEdit: Client;
  phonesToAdd: { number: string }[];
}) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";
  const { id, name, email } = clientToEdit;
  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/Clients/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while creating the client.",
    };
  }

  // Adding new phone numbers
  if (phonesToAdd.length) {
    const upload = phonesToAdd.map((phone) => {
      return { number: phone.number, clientId: id };
    });
    const { error } = await createPhoneNumsBulkAction(upload);
    if (error) return { data: null, error: error };
  }

  // Handling the editing of phone numbers
  if (phonesToEdit.length) {
    const editPhones = phonesToEdit.map((phone) =>
      editPhoneNumAction({ id: phone.id, number: phone.number })
    );

    try {
      await Promise.all(editPhones);
    } catch (error: any) {
      return { data: null, error: error };
    }
  }

  // Handling the deleting of phone numbers.

  if (phonesToDelete.length) {
    const deletePhones = phonesToDelete.map((phone) =>
      deletePhoneNumByIdAction(phone.id)
    );

    await Promise.all(deletePhones);
  }

  revalidateTag("clients");
  // revalidatePath("/dashboard/customers");

  return { data: null, error: "" };
}

export async function deleteClientByIdAction(id: number, revalidate = true) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/Clients/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return {
      data: null,
      error: "Something went wrong while deleting the client.",
    };
  }
  // const data = await response.json();

  // return data;
  // revalidatePath("/products");
  if (revalidate) revalidateTag("clients");

  return { data: null, error: "" };
}

interface GetClientsCountActionProps {
  name?: string;
  email?: string;
  phone?: string;
}

export async function getClientsCountAction({
  name,
  email,
  phone,
}: GetClientsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return {
      data: null,
      error: "You are not authorized to get the products count data.",
    };

  let query = `${process.env.API_URL}/api/Clients/count?`;

  if (name) query = query + `&Name=${name}`;

  if (phone) query = query + `&phone=${phone}`;

  if (email) query = query + `&email=${email}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
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

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
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
      error: "Something went wrong while creating the product.",
    };
  }

  // const data = await response.json();
  // return data;

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

    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  // const data = await response.json();

  // return { data, error: "" };

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
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
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
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}
*/
