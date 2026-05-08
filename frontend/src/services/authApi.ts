import type { User } from "@/types"
import type z from "zod"
import { BASE_URL } from "@/lib/constants"
import type { SignUpFormSchema } from "@/lib/types"

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/users/login`, {
    method: "POST",
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to login")
  }

  const result = await res.json()

  return result.data.user
}

export async function logout(): Promise<{
  status: "success"
  message: string
}> {
  const res = await fetch(`${BASE_URL}/api/v1/users/logout`, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to logout")
  }

  const result = await res.json()

  return result.data
}

type SignupProps = Omit<z.infer<typeof SignUpFormSchema>, "confirmPassword">
export async function signup(signupData: SignupProps): Promise<User> {
  // 1. Double check the URL order (api/v1)
  const res = await fetch(`${BASE_URL}/api/v1/users/signup`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify(signupData),
  })

  const result = await res.json()

  if (!res.ok) {
    // Access the message property from your AppError/Global Error Handler
    throw new Error(result.message || "Failed to signup")
  }

  // 2. Note the nesting: result.data.user
  return result.data.user
}

export async function updateCurrentUser(formtData: FormData): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/users/updateMe`, {
    method: "PATCH",
    credentials: "include",
    body: formtData,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to updated user's data")
  }

  const results = await res.json()

  return results.data.user
}

// Used by admin
export async function updateUser({
  id,
  formData,
}: {
  id: string
  formData: FormData
}): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to updated user's data")
  }

  const results = await res.json()

  return results.data.user
}
export async function getCurrentUser(): Promise<User | undefined> {
  const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
    method: "GET",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error || "Failed to get current user")
  }

  const result = await res.json()

  return result.data.data
}

export async function getUserById(id: string): Promise<User | undefined> {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: "GET",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get user by ID")
  }

  const result = await res.json()

  return result.data.data
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${BASE_URL}/api/v1/users/forgotPassword`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error || "Failed to change password")
  }

  const data = await res.json()

  return data
}

export async function updatePassword(passwordData: {
  password: string
  currentPassword: string
}) {
  const res = await fetch(`${BASE_URL}/api/v1/users/updateMyPassword`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    credentials: "include",
    body: JSON.stringify(passwordData),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to change password")
  }

  const results = await res.json()

  return results
}

// Used by an already logged in user.
export async function resetPassword(password: string, token: string) {
  if (!token) {
    const error = `Invaild token:${token}`
    console.error(error)
    throw new Error(error)
  }

  const res = await fetch(`${BASE_URL}/api/v1/users/resetPassword/${token}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error || "Failed to change password")
  }

  const data = await res.json()

  // return data.user
}
