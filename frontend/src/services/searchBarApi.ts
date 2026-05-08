import { BASE_URL } from "@/lib/constants"
import type { Product } from "@/types"
import type { ProductType } from "@/types/productTypes"

export async function searchBarResults(searchTerm: string) {
  const fetchOptions = { credentials: "include" as const }

  // Helper to fetch and return the data array
  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url, fetchOptions)
      if (!res.ok) throw new Error("Fetch failed")
      const json = await res.json()
      return json.data.data || []
    } catch (err) {
      console.error(`Error fetching from ${url}:`, err)
      return []
    }
  }

  // 1. Define URLs
  //URL Safety: I added encodeURIComponent. If a user searches for something with a space or special character (e.g., "Engine Oil & Filters"), the URL won't break.
  const searchParam = encodeURIComponent(searchTerm)
  const prodUrl = `${BASE_URL}/api/v1/products?limit=5&name=${searchParam}`
  const typeUrl = `${BASE_URL}/api/v1/productTypes?name=${searchParam}`

  // Category URL changes based on whether we are searching or showing "Top 10"
  const catUrl = searchTerm
    ? `${BASE_URL}/api/v1/categories?name=${searchParam}`
    : `${BASE_URL}/api/v1/categories?limit=10`

  // 2. Parallel Execution with Conditionals
  // If no searchTerm, we use Promise.resolve([]) to skip the network call
  const [products, productTypes, categories] = await Promise.all([
    searchTerm ? safeFetch(prodUrl) : Promise.resolve([]),
    searchTerm ? safeFetch(typeUrl) : Promise.resolve([]),
    safeFetch(catUrl),
  ])

  return {
    categories,
    productTypes,
    products,
  }
}

// export async function searchBarResults(searchTerm:string){
//    let  productQuery = `${BASE_URL}/api/v1/products?limit=5`

// let productTypeQuery = `${BASE_URL}/api/v1/productTypes?`

// let categoryQuery = `${BASE_URL}/api/v1/categories?`

// if(searchTerm) {
//     productQuery += `name=${searchTerm}`
//     categoryQuery += `name=${searchTerm}`
//     productTypeQuery += `name=${searchTerm}`

// }else {
//     categoryQuery += `limit=10`
// }

// let products : Product[] = []
// let productTypes :ProductType[] =[]

// if(searchTerm) {
//         const productRes = await fetch(productQuery,{
//         credentials:"include"

//     })

//     if(!productRes.ok) {
//         const error = await productRes.json()

//         console.error(`Failed to grab the search results for the products: ${error.message}`)
//     }else {
//         const productsData = await productRes.json()
//         products = productsData.data
//     }

//       const productTypesRes = await fetch(productTypeQuery,{
//         credentials:"include"
//     })

//         if(!productTypesRes.ok) {
//         const error = await productTypesRes.json()

//         console.error(`Failed to grab the search results for the sub-categories: ${error.message}`)
//     }else {
//             const productTypsData = await productTypesRes.json()
//         productTypes = productTypsData.data
//     }
// }

//   const categoryRes = await fetch(categoryQuery,{
//         credentials:"include"
//     })

//     if(categoryRes.ok) {
//         const error = await categoryRes.json()
//         throw new Error(`Failed to get search results: ${error.messsage}`)
//     }
//     const data = await categoryRes.json()

//     return {
//         categories:data.data,
//         productTypes,
//         products
//     }

// }
