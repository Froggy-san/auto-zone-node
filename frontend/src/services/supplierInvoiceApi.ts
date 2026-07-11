import { BASE_URL } from "@/lib/constants"
import type {
  AddSupplierInvoiceItemInput,
  CreateSupplierInvoiceInput,
  UpdateSupplierInvoiceInput,
  UpdateSupplierInvoiceItemInput,
} from "@/schemas/supplierInvoice.schema"
import type { SupplierInvoice } from "@/types/supplierInvoiceTypes"
import qs from "qs"
import type z from "zod"

export async function getSupplierInvoices(
  filters?: Record<string, any>
): Promise<SupplierInvoice[]> {
  const queryString = qs.stringify(filters || {}, {
    arrayFormat: "indices",
    skipNulls: true,
    encodeValuesOnly: true,
  })
  const res = await fetch(
    `${BASE_URL}/api/v1/supplierInvoices?${queryString}`,
    {
      credentials: "include",
    }
  )

  if (!res.ok) {
    const message =
      (await res.json()).message || "Failed to get the supplier invoices data"
    console.log(message)
    throw new Error(message)
  }

  const data = await res.json()

  return data.data
}

export async function getSupplierInvoicesById(
  id: string
): Promise<SupplierInvoice> {
  const res = await fetch(`${BASE_URL}/api/v1/supplierInvoices/${id}`, {
    credentials: "include",
  })

  if (!res.ok) {
    const message =
      (await res.json()).message || "Failed to get the supplier invoice data"
    console.log(message)
    throw new Error(message)
  }

  const data = await res.json()

  return data.data
}

export async function createSupplierInvoice(
  data: CreateSupplierInvoiceInput
): Promise<SupplierInvoice> {
  const res = await fetch(`${BASE_URL}/api/v1/supplierInvoices`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "applecation/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const message =
      (await res.json()).message || "Failed to create supplier invoice"

    throw new Error(message)
  }

  const result = await res.json()

  return result.data
}

type UpdateInvoice = UpdateSupplierInvoiceInput & {
  id: string
}
export async function updateSupplierInvoice(
  data: UpdateInvoice
): Promise<SupplierInvoice> {
  const res = await fetch(`${BASE_URL}/api/v1/supplierInvoices/${data.id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "applecation/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const message =
      (await res.json()).message || "Failed to update supplier invoice"

    throw new Error(message)
  }

  const result = await res.json()

  return result.data
}

export async function addSupplierInvoiceItem({
  data,
  supplierInvoiceId,
}: {
  data: AddSupplierInvoiceItemInput
  supplierInvoiceId: string
}): Promise<SupplierInvoice> {
  const res = await fetch(
    `${BASE_URL}/api/v1/supplierInvoices/${supplierInvoiceId}/items`,
    {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  if (!res.ok) {
    const message =
      (await res.json()).message ||
      "Failed to add a new item to the supplier invoice"

    throw new Error(message)
  }
  const result = await res.json()

  return result.data
}

export async function updateSupplierInvoiceItem({
  data,
  supplierInvoiceId,
}: {
  data: UpdateSupplierInvoiceItemInput
  supplierInvoiceId: string
}): Promise<SupplierInvoice> {
  const res = await fetch(
    `${BASE_URL}/api/v1/supplierInvoices/${supplierInvoiceId}/items/${data.product}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "applecation/json",
      },
      body: JSON.stringify(data),
    }
  )

  if (!res.ok) {
    const message =
      (await res.json()).message || "Failed to update supplier invoice item"

    throw new Error(message)
  }

  const result = await res.json()

  return result.data
}

export async function deleteSupplierInvoice({
  id,
  shouldRemoveStock = false,
}: {
  id: string
  shouldRemoveStock?: boolean
}) {
  const response = await fetch(`${BASE_URL}/api/v1/supplierInvoice/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shouldRemoveStock,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Error deleting supplier invoice:", errorData)
    throw new Error(errorData.message || "Failed to delete service")
  }
}

export async function deleteSupplierInvoiceItem({
  supplierInvoiceId,
  supplierInvoiceItemId,
  shouldRemoveStock = false,
}: {
  supplierInvoiceId: string
  supplierInvoiceItemId: string
  shouldRemoveStock?: boolean
}) {
  const response = await fetch(
    `${BASE_URL}/api/v1/supplierInvoice/${supplierInvoiceId}/items/${supplierInvoiceItemId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shouldRemoveStock,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Error deleting supplier invoice:", errorData)
    throw new Error(errorData.message || "Failed to delete service")
  }
}
