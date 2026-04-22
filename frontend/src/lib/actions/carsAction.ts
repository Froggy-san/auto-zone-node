"use server";
import { getToken } from "@lib/helper";
import { Car, CarImage, CarItem } from "@lib/types";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { getClientByIdAction } from "./clientActions";
import { PAGE_SIZE } from "@lib/constants";
import { createClient } from "@utils/supabase/server";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
interface GetCarsProps {
  color?: string;
  plateNumber?: string;
  chassisNumber?: string;
  motorNumber?: string;
  clientId?: string;
  carGenerationId?: string;
  pageNumber?: string;
  carMakerId?: string;
  carModelId?: string;
}

import { SupabaseClient } from "@supabase/supabase-js";
import { deleteImageFromBucketSr } from "@lib/services/server-helpers";

export async function revlidateCars(id?: number) {
  revalidateTag("cars");
  revalidatePath(`/garage/${id}`);
}
export async function revalidateCarPath(id: number) {
  revalidatePath(`/garage/${id}`);
}
// Define the cached function
const getCars = async ({
  supabase, // Pass the Supabase client as an argument
  color,
  chassisNumber,
  motorNumber,
  clientId,
  carGenerationId,
  plateNumber,
  pageNumber,
  carMakerId,
  carModelId,
}: GetCarsProps & { supabase: SupabaseClient }) => {
  const from = pageNumber ? (Number(pageNumber) - 1) * PAGE_SIZE : 0;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("cars")
    .select(
      "*, carImages(*), carGenerations!inner(*,carModels!inner(*,carMakers!inner(*)))",
      {
        count: "exact",
      }
    )
    .order("created_at", { ascending: false })
    .order("created_at", {
      referencedTable: "carImages",
      ascending: true,
    });

  if (chassisNumber) query = query.ilike("chassisNumber", `%${chassisNumber}%`);
  if (motorNumber) query = query.ilike("motorNumber", `%${motorNumber}%`);
  if (plateNumber) query = query.ilike("plateNumber", `%${plateNumber}%`);
  if (color) query = query.ilike("color", `%${color}%`);
  if (clientId) query = query.eq("clientId", clientId);
  if (carGenerationId) query = query.eq("carGenerationId", carGenerationId);
  if (carMakerId)
    query = query.eq("carGenerations.carModels.carMakerId", carMakerId);
  if (carModelId) query = query.eq("carGenerations.carModelId", carModelId);

  if (pageNumber) query = query.range(from, to);

  const { data: cars, count, error } = await query;

  if (error) return { data: null, error: error.message };

  return { data: { cars, count }, error: "" };
};

// Wrap the function with unstable_cache
export const getCarsAction = unstable_cache(getCars, ["cars"], {
  tags: ["cars"],
});

interface CarCreatedProps {
  color: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  notes: string;
  clientId: number;
  carGenerationId: number;
}

export async function createCarAction({
  car,
  images,
}: {
  car: CarCreatedProps;
  images: FormData[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cars").insert([car]).select();

  if (error) return { data: null, error: error.message };

  if (!images.length) {
    revalidateTag("cars");
    return { data, error: "" };
  }

  const { id } = data?.[0];

  // URL : https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/carImages//painting-from-2020-v0-ktyvxqe60qne1.webp
  const imageObjs = images.map((image) => {
    const img = image.get("image") as File;
    const isMain = image.get("isMain");

    const name = `${Math.random()}-${img.name}`.replace(/\//g, "");

    return {
      path: `${supabaseUrl}/storage/v1/object/public/carImages/${name}`,
      name,
      isMain: isMain === "true",
      file: img,
    };
  });

  const dataForImagesTable = imageObjs.map((obj) => {
    return { carId: id, imagePath: obj.path, isMain: obj.isMain };
  });

  const { data: imagesData, error: imagesError } = await supabase
    .from("carImages")
    .insert(dataForImagesTable)
    .select();

  if (imagesError)
    return {
      data,
      error: `Error from the Table: ${imagesError.message}`,
    };
  // 3. Handle image uploads to the bucket.
  let finalError = "";

  // Use Promise.all to handle concurrent uploads.
  const uploadPromises = imageObjs.map(async (img) => {
    try {
      const { data, error } = await supabase.storage
        .from("carImages")
        .upload(img.name, img.file);

      if (error) {
        console.log("ERROR:", error.message);
        throw new Error(error.message);
      }

      console.log("UPLOAD SUCCESS:", data);
      return data;
    } catch (err: any) {
      console.log("UPLOAD ERROR:", err);
      finalError = err.message;
    }
  });

  await Promise.all(uploadPromises);

  if (finalError) {
    return {
      data,
      error: `Image upload error: ${finalError}`,
    };
  }

  revalidateTag("cars");

  return { data: id, error: "" };
}

export async function getCarByIdAction(id: string) {
  const { data, error } = await getClientByIdAction(id, "id");

  if (error) return { data, error };

  return { data, error: "" };
}

export async function editCarAction({
  car,
  id,
  imagesToUpload,
  imagesToDelete,
  isEqual,
}: {
  car: Car;
  id: string;
  imagesToUpload: FormData[];
  imagesToDelete: CarImage[];
  isEqual: boolean;
}) {
  const {
    plateNumber,
    motorNumber,
    chassisNumber,
    carGenerationId,
    notes,
    color,
  } = car;
  const token = getToken();
  if (!token) redirect("/login");

  if (!isEqual) {
    const response = await fetch(`${process.env.API_URL}/api/cars/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        plateNumber,
        motorNumber,
        chassisNumber,
        carGenerationId,
        notes,
        color,
      }),
    });
    if (!response.ok) {
      if (response.status === 409) {
        return { data: null, error: (await response.json()).message };
      }

      return {
        data: null,
        error: "Something went wrong while creating the car.",
      };
    }
  }

  if (imagesToUpload.length) {
    const upload = imagesToUpload.map((image) => {
      image.append("carId", id);

      return createCarImageAction(image);
    });

    await Promise.all(upload);
  }

  if (imagesToDelete.length) {
    const deleteImages = imagesToDelete.map((deletedImage) =>
      deleteCarImageAction(deletedImage.id)
    );

    await Promise.all(deleteImages);
  }

  revalidateTag("cars");
  revalidatePath(`/garage/${id}`);

  return { data: null, error: "" };
}

export async function deleteCarAction(
  clientId: number,
  id: number,
  imagePaths: string[] = []
) {
  const supabase = await createClient();
  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) return { error: error.message };

  if (!imagePaths.length) {
    revalidateTag("cars");
    return { data: null, error: "" };
  }

  const returnFromBucket = await deleteImageFromBucketSr({
    bucketName: "carImages",
    imagePaths,
  });

  if (returnFromBucket.error) return { error: returnFromBucket.error };

  revalidateTag("cars");
  revalidatePath(`/garage/${clientId}`);

  return { data: null, error: "" };
}
interface GaragePaginationProps {
  color?: string;
  plateNumber?: string;
  chassisNumber?: string;
  motorNumber?: string;
  clientId?: string;
  carInfoId?: string;
  carMakerId: string;
  carModelId: string;
}

export async function getCarsCountAction({
  color,
  plateNumber,
  motorNumber,
  chassisNumber,
  clientId,
  carInfoId,
  carMakerId,
  carModelId,
}: GaragePaginationProps) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/Cars/count?`;

  if (color) query = query + `&color=${color}`;
  if (plateNumber) query = query + `&PlateNumber=${plateNumber}`;
  if (chassisNumber) query = query + `&ChassisNumber=${chassisNumber}`;
  if (motorNumber) query = query + `&MotorNumber=${motorNumber}`;
  if (carInfoId) query = query + `&CarInfoId=${carInfoId}`;
  if (clientId) query = query + `&ClientId=${clientId}`;
  if (carMakerId) query = query + `&carMakerId=${carMakerId}`;
  if (carModelId) query = query + `&carModelId=${carModelId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // next: {
    //   tags: ["carCount"],
    // },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch cars count.",
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

export async function createCarImageAction(formData: FormData) {
  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/CarImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Had truble creating a product.");
  }
}

export async function deleteCarImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/CarImages/${imageId}`,
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

// ----

/*

"use server";
import { getToken } from "@lib/helper";
import { Car, CarImage, CarItem } from "@lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getClienttByIdAction } from "./clientActions";
import { PAGE_SIZE } from "@lib/constants";

interface GetCarsProps {
  color?: string;
  plateNumber?: string;
  chassisNumber?: string;
  motorNumber?: string;
  clientId?: string;
  carInfoId?: string;
  pageNumber?: string;
  carMakerId?: string;
  carModelId?: string;
}

export async function getCarsAction({
  color,
  chassisNumber,
  motorNumber,
  clientId,
  carInfoId,
  plateNumber,
  pageNumber,
  carMakerId,
  carModelId,
}: GetCarsProps) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/Cars?&PageSize=${PAGE_SIZE}`;

  if (pageNumber) query = query + `&pageNumber=${pageNumber}`;
  if (color) query = query + `&color=${color}`;
  if (plateNumber) query = query + `&PlateNumber=${plateNumber}`;
  if (chassisNumber) query = query + `&ChassisNumber=${chassisNumber}`;
  if (motorNumber) query = query + `&MotorNumber=${motorNumber}`;
  if (carInfoId) query = query + `&carGenerationId=${carInfoId}`;
  if (clientId) query = query + `&clientId=${clientId}`;
  if (carMakerId) query = query + `&carMakerId=${carMakerId}`;
  if (carModelId) query = query + `&carModelId=${carModelId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["cars"],
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch cars data.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

interface CarCreatedProps {
  color: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  notes: string;
  clientId: number;
  carGenerationId: number;
}

export async function createCarAction({
  car,
  images,
}: {
  car: CarCreatedProps;
  images: FormData[];
}) {
  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/cars`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(car),
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while creating the car.",
    };
  }

  const { id } = await response.json();

  if (images.length) {
    const upload = images.map((image) => {
      image.append("carId", id);

      return createCarImageAction(image);
    });

    await Promise.all(upload);
  }

  revalidateTag("cars");
  // revalidateTag("carCount");
  return { data: id, error: "" };
}

export async function getCarByIdAction(id: string) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  // const response = await fetch(`${process.env.API_URL}/api/Cars/${id}`, {
  //   method: "GET",
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     // "Content-type": "application/json",
  //   },
  // });

  // if (!response.ok) {

  //   return {
  //     data: null,
  //     error: "Something went wrong while grabbing the car.",
  //   };
  // }

  // const car = (await response.json()) as CarItem;

  const { data, error } = await getClienttByIdAction(Number(id));

  return { data, error: "" };
}

export async function editCarAction({
  car,
  id,
  imagesToUpload,
  imagesToDelete,
  isEqual,
}: {
  car: Car;
  id: string;
  imagesToUpload: FormData[];
  imagesToDelete: CarImage[];
  isEqual: boolean;
}) {
  const {
    plateNumber,
    motorNumber,
    chassisNumber,
    carGenerationId,
    notes,
    color,
  } = car;
  const token = getToken();
  if (!token) redirect("/login");

  if (!isEqual) {
    const response = await fetch(`${process.env.API_URL}/api/cars/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        plateNumber,
        motorNumber,
        chassisNumber,
        carGenerationId,
        notes,
        color,
      }),
    });
    if (!response.ok) {
      if (response.status === 409) {
        return { data: null, error: (await response.json()).message };
      }

      return {
        data: null,
        error: "Something went wrong while creating the car.",
      };
    }
  }

  if (imagesToUpload.length) {
    const upload = imagesToUpload.map((image) => {
      image.append("carId", id);

      return createCarImageAction(image);
    });

    await Promise.all(upload);
  }

  if (imagesToDelete.length) {
    const deleteImages = imagesToDelete.map((deletedImage) =>
      deleteCarImageAction(deletedImage.id)
    );

    await Promise.all(deleteImages);
  }

  revalidateTag("cars");
  revalidatePath(`/garage/${id}`);

  return { data: null, error: "" };
}

export async function deleteCarAction(id: string) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/cars/${id}`, {
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

    return {
      data: null,
      error: "Something went wrong while deleting the car.",
    };
  }

  revalidateTag("cars");
  // revalidateTag("carCount");

  return { data: null, error: "" };
}
interface GaragePaginationProps {
  color?: string;
  plateNumber?: string;
  chassisNumber?: string;
  motorNumber?: string;
  clientId?: string;
  carInfoId?: string;
  carMakerId: string;
  carModelId: string;
}

export async function getCarsCountAction({
  color,
  plateNumber,
  motorNumber,
  chassisNumber,
  clientId,
  carInfoId,
  carMakerId,
  carModelId,
}: GaragePaginationProps) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/Cars/count?`;

  if (color) query = query + `&color=${color}`;
  if (plateNumber) query = query + `&PlateNumber=${plateNumber}`;
  if (chassisNumber) query = query + `&ChassisNumber=${chassisNumber}`;
  if (motorNumber) query = query + `&MotorNumber=${motorNumber}`;
  if (carInfoId) query = query + `&CarInfoId=${carInfoId}`;
  if (clientId) query = query + `&ClientId=${clientId}`;
  if (carMakerId) query = query + `&carMakerId=${carMakerId}`;
  if (carModelId) query = query + `&carModelId=${carModelId}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // next: {
    //   tags: ["carCount"],
    // },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch cars count.",
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

export async function createCarImageAction(formData: FormData) {
  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/CarImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Had truble creating a product.");
  }
}

export async function deleteCarImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/CarImages/${imageId}`,
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
