import type { FileRejection, FileWithPath } from "react-dropzone"
import { z } from "zod"
import { MIN_PASS_LENGTH } from "./constants"

export function validateEgyptianPhoneNumber(phoneNumber: string) {

  // define the regex
  const regex = /^01[0125][0-9]{8}$/
  // test the string against the regex
  if (regex.test(phoneNumber)) {
    // return true if it matches
    return true
  } else {
    // return false if it doesn't
    return false
  }
}

export const LoginFormSchema = z.object({
  username: z
    .string()
    .describe("Username")
    .min(3, { message: "Invaild user name" }),
  password: z
    .string()
    .describe("Password")
    .min(6, { message: "Invaild user name" }),
})

export const SignUpFormSchema = z
  .object({
    email: z
      .string()
      .describe("Email")
      .min(6, { message: "Invaild user name" }),
    username: z
      .string()
      .describe("Username")
      .min(6, { message: "Invaild user name" }),
    password: z
      .string()
      .describe("Password")
      .min(MIN_PASS_LENGTH, { message: "Invaild password" }),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(MIN_PASS_LENGTH, { message: "Invaild password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .describe("Password")
      .min(MIN_PASS_LENGTH, { message: "Invaild password" }),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(MIN_PASS_LENGTH, { message: "Invaild password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

const RowSchema = z.object({
  title: z.string().min(3, "Title is too short.").max(50, "Title is too long."),
  description: z
    .string()
    .min(3, "Description is too short.")
    .max(150, "Description is too long."),
})

export const AdditionalDetailsSchema = z.object({
  _id:z.string().optional(),
  title: z.string().min(3, "Title is too short."),
  table: z.array(RowSchema),
  description: z.string(),
})
// .partial({ id: true, productId: true, created_at: true });

export const ProductsSchema = z
  .object({
    name: z
      .string()
      .min(4, "Product name is too short")
      .max(100, "Product name is too long."),

    description: z.string(),
    category: z.string().min(1, "Product has to have a category."),
    productType: z.string().min(1, "Product has to have a type."),
    productBrand: z.string().min(1, "Product has to have a brand."),

    listPrice: z.number().min(5, "Invalid listing price."),

    salePrice: z.number().min(0, "Sale price cannot be negative."),

    stock: z.number().min(0, "Stock cannot be negative."),
    carMaker: z.string().nullable(),
    carModel: z.string().nullable(),

    generations: z.array(z.string()),

    isAvailable: z.boolean(),

    images: z
      .array(z.custom<FileWithPreview>())
      .max(15, "You can only upload up to 15 images."),
    mainImageName: z.string(),

    moreDetails: z.array(AdditionalDetailsSchema),
  })
  .refine((data) => data.listPrice > data.salePrice, {
    message: "Listing price must be greater than sale price",
    path: ["salePrice"],
  })
export const CarGenerationsSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is too short" })
    .max(55, { message: "Name is too long." }),
  carModelId: z.number().default(0),
  notes: z.string(),
  image: z.custom<File[] | string[]>(),
})

export const CategorySchema = z.object({
  name: z.string(),
  image: z.custom<File[]>(),
})

export const ProductTypeSchema = z.object({
  insert: z.array(
    z.object({
      name: z.string().min(3, { message: "Too short" }),
      categoryId: z.number(),
      image: z.custom<File[]>(),
    })
  ),
})
export const CarInfoSchema = z.object({
  carMakerId: z.number(),
  carModelId: z.number(),
  carGenerationId: z.number(),
})

export const CarModelSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is too short" })
    .max(55, { message: "Name is too long." }),
  carMakerId: z.number().default(0),
  notes: z.string(),
})

export const CarSchema = z.object({
  color: z.string(),
  plateNumber: z
    .string()
    .min(1, { message: "Plate number is required!" })
    .max(55, { message: "Plate number is too long." }),
  chassisNumber: z
    .string()
    .min(1, { message: "Chassi number is required!" })
    .max(55, { message: "Chassi number is too long." }),
  motorNumber: z
    .string()
    .min(1, { message: "Motor number is required!" })
    .max(55, { message: "Motor number is too long." }),
  notes: z.string(),
  clientId: z.number().default(0),
  carGenerationId: z.number().default(0),
})

export const CreateCarMakerScehma = z.object({
  name: z
    .string()
    .min(2, { message: "Toos short" })
    .max(55, { message: "Too long" }),
  notes: z.string(),
  logo: z.custom<File[]>(),
})

export const CreateCarModelSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Toos short" })
    .max(55, { message: "Too long" }),
  carMakerId: z.number(),
  notes: z.string(),
  image: z.custom<File[]>(),
})

export const CreateCarInfoSchema = z.object({
  carMakerId: z.number(),
  carModelId: z.number(),
  carGenerationId: z.number(),
})

export const CreateProdcutImageSchema = z.object({
  image: z.custom<File[]>(),
  productId: z.number(),
  isMain: z.boolean().default(false),
})

export const EditNameAndNote = z.object({
  name: z
    .string()
    .min(3, { message: "Too short." })
    .max(100, { message: "Too long." }),
  carModelId: z.number(),
  notes: z.string(),
})

const HslColorValues = z.object({
  h: z.number(),
  s: z.number(),
  l: z.number(),
})
export const ServiceStatusSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Name is too short." })
    .max(33, { message: "Name is too long." }),
  colorLight: HslColorValues,
  colorDark: HslColorValues,
  description: z.string(),
})

// const phone = z.object({
//   id: z.number().nullable(),
//   number: z
//     .string()
//     .min(11, { message: "This phone number is too short" })
//     .max(11, { message: "This phone number is too long." })
//     .refine((phone) => validateEgyptianPhoneNumber(phone), {
//       message: "This phone number is not valid",
//     }),
//   clientId: z.number().nullable(),
// });

const phone = z
  .object({
    id: z.number(),
    number: z
      .string()
      .min(11, { message: "This phone number is too short" })
      .max(11, { message: "This phone number is too long." })
      .refine((phone) => validateEgyptianPhoneNumber(phone), {
        message: "This phone number is not valid",
      }),
    clientId: z.number(),
  })
  .partial({ id: true, clientId: true })

export const CreateClientSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Put a valid name" })
    .max(100, { message: "The name is too long" }),
  email: z.string().describe("Email"),
  phones: phone.array(),
})

export const CreateCarSchema = z.object({
  color: z.string(),
  plateNumber: z
    .string()
    .min(1, "Plate number is required")
    .max(30, { message: "Plate number is too long." }),
  chassisNumber: z.string(),
  motorNumber: z.string(),
  notes: z.string(),
  odometer: z.string(),
  clientId: z.number().min(1, { message: "Every car must have an owner" }),
  carGenerationId: z
    .number()
    .min(1, { message: "Every car must have car generation" }),
  images: z.array(z.custom<FileWithPreview>()).max(9, {
    message: "You can only upload up to 9 images at a time.",
  }),
})

export const ProductBoughtSchema = z
  .object({
    pricePerUnit: z.number().min(1, { message: "Price per unit is requried" }),
    discount: z.number(),
    count: z.number().min(1, { message: "Count is requried" }),
    note: z.string(),
    productId: z.number().min(1, { message: "Product is required" }),
    productsRestockingBillId: z.string(),
  })
  .refine((data) => data.pricePerUnit * data.count - data.discount > 0, {
    message: "Discount must be less than the total amount",
    path: ["discount"],
  })

export const CreateProductBoughtSchema = z.object({
  productBought: ProductBoughtSchema.array(),
  shopName: z
    .string()
    .min(4, { message: "Shop name is required." })
    .max(77, { message: "Shop name is too long." }),
})

export const ProductToSellSchema = z
  .object({
    pricePerUnit: z.number().min(1, { message: "Price is required" }),
    discount: z.number(),
    count: z.number().min(1, { message: "Count is required" }),
    note: z.string(),
    productId: z.number().min(1, { message: "Product is required" }),
  })
  .refine((data) => data.pricePerUnit * data.count - data.discount > 0, {
    message: "Discount must be less than the total amount",
    path: ["discount"],
  })

export const CreateServiceFeeSchema = z
  .object({
    categoryId: z.number().min(1, { message: "Category is required." }),
    price: z.number().min(1, { message: "Price is required" }),
    discount: z.number(),
    notes: z.string(),
  })
  .refine((data) => data.price > data.discount, {
    message: "Discount amount can't exceed the price amount.",
    path: ["discount"],
  })

export const CreateServiceSchema = z.object({
  clientId: z.number().min(1, { message: "Client is required." }),
  carId: z.number().min(1, { message: "Car is required." }),
  kmCount: z.string(),
  priority: z.string(),
  serviceStatusId: z
    .number()
    .min(1, { message: "Service status is required." }),
  note: z.string(),
  productsToSell: ProductToSellSchema.array(),
  serviceFees: CreateServiceFeeSchema.array(),
  // .min(1, {
  //   message: "Service must have atleast on serivce fee.",
  // }),
})

export const ServiceFeeSchema = z
  .object({
    price: z.number().min(1, { message: "Price is requried" }),
    discount: z.number(),
    isReturned: z.boolean(),
    notes: z.string(),
    categoryId: z.number().min(1, { message: "Category is requried" }),
  })
  .refine((data) => data.price > data.discount, {
    message: "Discount amount can't exceed the price amount.",
    path: ["discount"],
  })

export const ProductSoldSchema = z
  .object({
    pricePerUnit: z.number().min(1, { message: "Requried!" }),
    discount: z.number(),
    count: z.number().min(1, { message: "Requried!" }),
    isReturned: z.boolean(),
    note: z.string(),
    productId: z.number().min(1, { message: "Required!" }),
    serviceId: z.number().min(1, { message: "Required!" }),
  })
  .refine((data) => data.pricePerUnit * data.count - data.discount > 0, {
    message: "Discount must be less than the total amount",
    path: ["discount"],
  })

export const EditServiceSchema = z.object({
  created_at: z.date(),
  clientId: z.number().min(1, { message: "Requried" }),
  carId: z.number().min(1, { message: "Requried" }),
  serviceStatusId: z.number().min(1, { message: "Requried" }),
  note: z.string(),
})

export const CreateTicketSchema = z.object({
  subject: z
    .string()
    .max(250, { message: "Subject is too long." })
    .min(3, { message: "Subject is too short." }),

  description: z
    .string()
    .min(20, { message: "Description of the ticket is too short." }),
  client_id: z.number(),
  updated_at: z.string(),
  admin_assigned_to: z.string().nullable(),
  ticketStatus_id: z.number(),
  ticketPriority_id: z.number(),
  ticketCategory_id: z.number(),
})

export const MessageSchema = z
  .object({
    ticket_id: z.number(),
    senderId: z
      .string()
      .min(5, { message: "Sender ID is invailed" })
      .max(30, { message: "Sender ID is too long, please put a vaild ID" }),

    senderType: z.string().min(5, { message: "Enter a vaild role." }).max(6, {
      message: `Role enter is too long, please pick "client" or "admin"`,
    }),
    client_id: z.number(),

    content: z.string().min(5, { message: "Message is too short" }).max(2000, {
      message:
        "Message is too long, please send that one and then continue the rest in onther message",
    }),
    is_internal_note: z.boolean().default(false),
  })
  .refine(
    (values) => values.senderType === "client" || values.senderType === "admin",
    {
      message: `Enter a vaild role "client" or "admin".`,
    }
  )

//! TICEKT HISTORY SCHMEA  START

// Define schemas for specific action types
export const StatusChangeDetails = z.object({
  old_status: z.string(),
  new_status: z.string(),
  reason: z.string().optional(),
})

export const AssignmentDetails = z.object({
  old_admin_id: z.string().uuid().nullable(),
  new_admin_id: z.string().uuid(),
})

export const TicketHistoryAction = z.enum([
  "created",
  "message",
  "assigned",
  "reassigned",
  "updated",
  "solved",
  "closed",
  "reopened",
  "escalated",
  "comment",
  "Internal Note",
  "Internal Note Edited",
  "message edited",
  "message deleted",
  "Status Changed",
  "System Auto-Closed",
  "Priority Changed",
  // "Admin Assigned",
  // "Internal Note Added",
  // "Ticket Created",
  // "Customer Message Added",
  // "Admin Message Added",
  // "Customer Responded",
  // "Assigned To a different admin",
]) // Limited actions for simplicity

export const TicektHistoryDetials = z.union([
  StatusChangeDetails,
  AssignmentDetails,
  z.record(z.string(), z.any()), // Fallback for other actions
])
// The final schema uses a discriminated union for type safety
export const TicketHistorySchemaStrict = z.object({
  // ... other fields (id, ticket_id, actor_id, created_at)
  ticket_id: z.number(), // Foreign key to the ticket
  actor_id: z.number().nullable(), // The user/admin who took the action
  action: TicketHistoryAction, // Limited actions for simplicity
  details: TicektHistoryDetials,
  message_id: z.number().nullable(),
})

//! TICEKT HISTORY SCHMEA  END

export const NotificationSchema = z.object({
  user_id: z.string().uuid(),
  ticket_id: z.number(),
  message: z.string(),
  is_read: z.boolean().default(false),
})

export const PaymentMethod = z.enum(["card", "cod"])
export const PaymentStatusSchema = z.enum([
  "unpaid",
  "paid",
  "pending_arrival",
  "canceled",
  "disputed",
  "refunded",
])
export const OrderStatusSchema = z.enum([
  "pending_arrival",
  "ready_for_pickup",
  "completed",
  "partially_completed",
  "returned",
  "cancelled",
  "processing",
])

export const OrderSchema = z.object({
  client_id: z.number(),
  customer_details: z.record(z.string(), z.any()),
  items: z.record(z.string(), z.any()).nullable(),
  total_amount: z
    .number()
    .min(1, { message: "Total amount must be more than 0" }),
  payment_method: PaymentMethod,
  payment_status: PaymentStatusSchema,
  order_status: OrderStatusSchema,
  stripe_payment_id: z.string().nullable(),
  metadata: z.record(z.string(), z.any()),
  pickupDate: z.string().nullable(),
})

export interface signUpProps {
  full_name: string
  email: string
  password: string
  role: "Admin" | "User"
  token?: string | null
}

// export interface User {
//   sub?: string;
//   jti?: string;
//   exp?: number;
//   iss?: string;
//   aud?: string | string[] | undefined;
// }

type Providers = "email" | "google"

export interface User {
  id: string
  // app_metadata: UserAppMetadata;
  // user_metadata: UserMetadata;
  aud: string
  confirmation_sent_at?: string
  recovery_sent_at?: string
  email_change_sent_at?: string
  new_email?: string
  new_phone?: string
  invited_at?: string
  action_link?: string
  email?: string
  phone?: string
  created_at: string
  confirmed_at?: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  last_sign_in_at?: string
  role?: string
  updated_at?: string
  // identities?: UserIdentity[];
  is_anonymous?: boolean
  // factors?: Factor[];
}
export interface TokenData {
  sub: string
  jti: string
  role?: string
  exp: number
  iss: string
  aud: string
}

export interface ProductBrand {
  id: number
  name: string
}

export interface ProductType {
  id: number
  name: string
  categoryId: number | null
  image: string | null
  created_at: string
}

export interface CarMakerData {
  id: number
  name: string
  notes: string
  logo: string | null
}
interface CarModelData {
  id: number
  name: string
  notes: string
}

interface CarGenerationData {
  id: 1
  name: string
  notes: string
}

export interface CarInfoProps {
  id: number
  carMaker: CarMakerData
  carModel: CarModelData
  carGeneration: CarGenerationData
}

export interface CarMaker {
  id: 2
  name: string
  carModels: {
    id: number
    name: string
    notes: string
    carModelId: number
  }
  notes: string
  logo: null | string
}
export interface CarMakersData {
  id: number
  createt_at: string
  name: string
  notes: string
  logo: string | null
  carModels: CarModelProps[]
}

export interface CarModelProps extends CarModel {
  id: number
  crated_at: string
  image: string | null
  carGenerations: CarGenerationProps[]
}
export interface CarGenerationProps extends Omit<CarGeneration, "image"> {
  id: number
  image: string | null
  crated_at: string
}

export interface CarBrand {
  created_at: string
  id: number
  logo: string
  name: string
  notes: string
  carModels: CarModelProps[]
}

export interface CreateProductProps {
  name: string
  categoryId: number
  productTypeId: number
  productBrandId: number
  description: string
  listPrice: number
  carinfoId: number
  salePrice: number
  stock: number
  isAvailable: boolean
  images: FormData[]
}

export interface mainProductImage {
  id: number
  imageUrl: string
  isMain: boolean
  productId: number
}

export interface ProductImage {
  id: number
  imageUrl: string
  isMain: boolean
  productId: number
  created_at: string
}

export interface Product {
  id: number
  categoryId: number
  created_at: string
  name: string
  description: string
  listPrice: number
  salePrice: number
  stock: number
  isAvailable: boolean
  productImages: ProductImage[]
  mainProductImage: mainProductImage | null
}

export interface ProductInProductToSell {
  id: number
  name: string
  category: Category
  productType: ProductType
  productBrand: ProductBrand
  dateAdded: string
  description: string
  listPrice: number
  salePrice: number
  stock: number
  isAvailable: boolean
  carInfos: CarInfoProps[]
  productImages: ProductImage[]
}

export interface ProductWithCategory extends Product {
  categories: { name: string }
}

export interface ProductById {
  id: number
  name: string
  categories: CategoryProps
  productTypes: ProductType
  productBrands: ProductBrand
  dateAdded: string
  created_at: string
  description: string
  listPrice: number
  salePrice: number
  stock: number
  makerId: number | null
  modelId: number | null
  carMakers: CarMakerData
  carModels: CarModelProps
  generationsArr: CarGenerationProps[]
  isAvailable: boolean
  carInfos: CarInfoProps[]
  productImages: ProductImage[]
  moreDetails: z.infer<typeof AdditionalDetailsSchema>[]
}

export interface EditProduct {
  id: number
  name: string
  categoryId: number
  description: string
  listPrice: number
  salePrice: number
  stock: number
  isAvailable: boolean
  makerId: number | null
  modelId: number | null
  generationsArr: string | null
}

export interface Client {
  id: number
  created_at: string
  name: string
  email: string
  user_id: string | null
  picture: string | null
  phoneNumbers?: string[]
  provider: string
  role: "client" | "admin"
  cars: { count: number }[]
}

export interface PhoneNumber {
  id: number
  number: string
  clientId: number
}

export interface ClientWithPhoneNumbers extends Client {
  phones: PhoneNumber[]
}

export interface CarImage {
  id: number
  imagePath: string
  isMain: boolean
  carId: number
}

interface CarInformation {
  id: number
  name: string
  notes: string
  image: string | null
  carModels: {
    id: number
    name: string
    notes: string
    carMakers: CarMaker
    image: string | null
    carMakerId: number
    created_at: string
  }
  carModelId: number
  created_at: string
}

export interface CarItem {
  id: number
  color: string
  plateNumber: string
  chassisNumber: string
  motorNumber: string
  odometer: string
  notes: string
  carImages: CarImage[]
  clientId: number
  carGenerations: CarInformation
}

export interface CarItemWithClient {
  id: number
  color: string
  plateNumber: string
  chassisNumber: string
  motorNumber: string
  notes: string
  carImages: CarImage[]
  client: ClientWithPhoneNumbers | undefined
  clientId: number
  carInfo: {
    id: number
    carMaker: CarMakerData
    carModel: CarModelData
    carGeneration: CarGenerationData
  }
}

export interface ClientById {
  id: number
  name: string
  email: string
  created_at: string
  user_id: string
  picture: string | null
  provider: Providers
  phones: PhoneNumber[]
  cars: CarItem[]
}

export interface ProductBought {
  id: number
  pricePerUnit: number
  discount: number
  count: number
  isReturned: boolean
  note: string
  totalPriceAfterDiscount: number
  productName: string
  productId: number
  product: Product
  productsRestockingBillId: number
  productsRestockingBills?: { totalPrice: number }
}

export interface ProductBoughtData {
  id: number
  shopName: string
  created_at: string
  totalPrice: number
  productsBought: ProductBought[]
}

export interface RestockingBill {
  id: number
  shopName: string
  dateOfOrder: string
  productsBought: ProductBought[]
}

export interface productsToSellProps {
  id: number
  pricePerUnit: number
  discount: number
  count: number
  totalPriceAfterDiscount: number
  isReturned: boolean
  note: string
  product: Product
}

export interface ServiceStatus {
  id: number
  name: string
  description: null | string
}

export interface ProductToSell {
  created_at: string
  id: number
  pricePerUnit: number
  discount: number
  count: number
  totalPriceAfterDiscount: number
  isReturned: boolean
  note: string
  productId: number
  serviceId: number
  product: Product
}

export interface ServiceFee {
  created_at: string
  id: number
  price: number
  discount: number
  totalPriceAfterDiscount: number
  isReturned: boolean
  notes: string
  categoryId: number
  serviceId: number
}

export interface Service {
  id: number
  created_at: string
  totalPriceAfterDiscount: number
  cars: CarItem
  priority: string
  kmCount: string
  serviceStatuses: ServiceStatus
  note: string
  productsToSell: ProductToSell[]
  servicesFee: ServiceFee[]
  clients: {
    id: number
    name: string
    email: string
    phones?: PhoneNumber[]
  }
}

export type EditDetails = {
  table: {
    title: string
    description: string
  }[]
  title: string
  description: string
  id: number
  productId: number
  created_at: string
}

export interface ServiceStatus {
  id: number
  name: string
  colorLight: string
  colorDark: string
  description: string | null
  services: any[]
}

export interface CartItem extends ProductById {
  quantity: number
  totalPrice: number
}

export interface categoryResult {
  id: number
  created_at: string
  name: string

  product: {
    categoryId: number
    created_at: string
    description: string
    id: number
    isAvailable: boolean
    listPrice: number
    makerId: number | null
    name: string
    productBrandId: number
    productBrands: { name: string }
    productImages: { imageUrl: string; isMain: boolean }
    productTypeId: number
    salePrice: number
    stock: number
  }[]
}

export type ImgData = {
  path: string
  name: string
  isMain: boolean
  file: FileWithPreview | File
}

export interface CategoryProps {
  id: number
  name: string
  created_at: string
  image?: string | null
  productTypes: ProductType[]
}

export interface RejectionFiles extends FileRejection {
  preview: string
}

// TICKETS --------------------------

export interface CreateTicketProps extends z.infer<typeof CreateTicketSchema> {
  user_id: string
  updated_at: string
  admin_assigned_to: string
}

export interface TicketPriority {
  id: number
  created_at: string
  name: string
}
export interface TicketStatus {
  id: number
  created_at: string
  name: string
  description: string
}

export interface TicketCategory {
  id: number
  created_at: string
  name: string
}

export interface Ticket {
  id: number
  created_at: string
  client: Client | null
  subject: string
  description: string
  ticketStatus_id: TicketStatus
  ticketPriority_id: TicketPriority
  ticketCategory_id: TicketCategory
  updated_at: string
  admin_assigned_to: Client | null
  resolveTime: string | null
  firstResponseTime: string | null
}

export interface CreateTicketStatus {
  name: string
  description: string
}

export interface TicketCategory {
  id: number
  created_at: string
  name: string
}

export interface Attachment {
  id: number
  ticket_id: number
  message_id: number
  file_url: string
  file_name: string
  file_type: string
  client_id?: Client
  file?: FileWithPreview
}

export type OptimisticAction =
  | { type: "add"; message: Message }
  | { type: "fail"; tempId: number; error: string }
  | { type: "succeed"; tempId: number; realMessage: Message }
  | { type: "remove"; tempId: number }

export interface CreateAttachment {
  file: File
  ticket_id: number
  message_id: number
  file_url: string
  file_name: string
  file_type: string
  client_id: number
  uploaded_by: string
}
// TICKETS --------------------------

export type FileWithPreview = FileWithPath & {
  preview: string
}

export type RejecetedFile = Omit<FileRejection, "File"> & {
  file: FileWithPreview
}

export type EditMessage = {
  id: number
  ticket_id?: number
  senderId?: string
  senderType?: string
  client_id?: number
  content?: string
  is_internal_note?: boolean
}
export interface EditMessageProps {
  editMessage: EditMessage
  newFiles?: FileWithPreview[]
  attachmentsToDelete?: Attachment[]
}

export interface GetUserByIdProps {
  data: {
    user: User
    client: Client | null
    isAdmin: boolean
    isCurrUser: boolean
  } | null

  error: string
}

export type Category = z.infer<typeof CategorySchema>
export type CreateProductWithImagesProps = z.infer<typeof ProductsSchema>
export type CarGeneration = z.infer<typeof CarGenerationsSchema>
export type CarInfo = z.infer<typeof CarInfoSchema>
export type CarModel = z.infer<typeof CarModelSchema>
export type Car = z.infer<typeof CarSchema>
export type CreateCarMaker = z.infer<typeof CreateCarMakerScehma>
export type CreateCarModel = z.infer<typeof CreateCarModelSchema>
export type CreateCarInfoSchema = z.infer<typeof CreateCarInfoSchema>
export type CreateClient = z.infer<typeof CreateClientSchema>
export type CreateCar = z.infer<typeof CreateCarSchema>
export type CreateProductBought = z.infer<typeof CreateProductBoughtSchema>
export type CreateService = z.infer<typeof CreateServiceSchema>
export type EditServiceFee = z.infer<typeof ServiceFeeSchema>
export type ProductSold = z.infer<typeof ProductSoldSchema>
export type EditService = z.infer<typeof EditServiceSchema>
export type ServiceStatusForm = z.infer<typeof ServiceStatusSchema>
export type HslColor = z.infer<typeof HslColorValues>
export type CreateTicket = z.infer<typeof CreateTicketSchema>
export interface Message extends z.infer<typeof MessageSchema> {
  id: number
  created_at: string
  client?: Client
  attachments: Attachment[]
  status?: "pending" | "failed"
}
export type Order = z.infer<typeof OrderSchema> & {
  id: number
  client?: Client
  order_fulfilled_at?: string
  created_at: string
}
export type TicketHistory = z.infer<typeof TicketHistorySchemaStrict> & {
  id: number
  created_at: string
  actor?: Client
  ticket?: Ticket
  message?: Message
}

export type Notification = z.infer<typeof NotificationSchema> & {
  id: number
  created_at: string
}
