// import { FileRejection } from "react-dropzone";
// import { z } from "zod";
// import { MIN_PASS_LENGTH } from "./constants";

// export function validateEgyptianPhoneNumber(phoneNumber: string) {
//   "use client";
//   // define the regex
//   const regex = /^01[0125][0-9]{8}$/;
//   // test the string against the regex
//   if (regex.test(phoneNumber)) {
//     // return true if it matches
//     return true;
//   } else {
//     // return false if it doesn't
//     return false;
//   }
// }
// export interface FilesWithPreview extends File {
//   preview: string;
// }
// export const LoginFormSchema = z.object({
//   username: z
//     .string()
//     .describe("Username")
//     .min(3, { message: "Invaild user name" }),
//   password: z
//     .string()
//     .describe("Password")
//     .min(6, { message: "Invaild user name" }),
// });

// export const SignUpFormSchema = z
//   .object({
//     email: z
//       .string()
//       .describe("Email")
//       .min(6, { message: "Invaild user name" }),
//     username: z
//       .string()
//       .describe("Username")
//       .min(6, { message: "Invaild user name" }),
//     password: z
//       .string()
//       .describe("Password")
//       .min(MIN_PASS_LENGTH, { message: "Invaild password" }),
//     confirmPassword: z
//       .string()
//       .describe("Confirm Password")
//       .min(MIN_PASS_LENGTH, { message: "Invaild password" }),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match.",
//     path: ["confirmPassword"],
//   });

// export const RowSchema = z.object({
//   title: z
//     .string()
//     .min(3, { message: "Title is too short." })
//     .max(50, { message: "Title is too long." }),
//   description: z
//     .string()
//     .min(3, { message: "Description is too short." })
//     .max(150, { message: "Description is too long." }),
// });

// export const AddetionalDetailsSchema = z
//   .object({
//     id: z.number(),
//     table: z.array(RowSchema),
//     title: z.string().min(3, { message: "Title is too short." }),
//     productId: z.number(),
//     description: z.string(),
//     created_at: z.string(),
//   })
//   .partial({ id: true, productId: true, created_at: true });

// export const ProductsSchema = z
//   .object({
//     name: z
//       .string()
//       .min(4, { message: "Product name is too short" })
//       .max(100, { message: "Product name is too long." }),
//     categoryId: z
//       .number()
//       .min(1, { message: "Product has to have a cateogry." }),
//     productTypeId: z
//       .number()
//       .min(1, { message: "Product has to have a type." }),
//     productBrandId: z
//       .number()
//       .min(1, { message: "Product has to have a brand." }),
//     description: z.string(),
//     // .min(4, { message: "Description  is too short" })
//     // .max(100, { message: "Description  is too long." }),
//     listPrice: z
//       .number()
//       .min(5, { message: "Need to input a vaild Listing price." }),
//     salePrice: z.number(),
//     carinfoId: z.number(), // this field is removed from the supabase data base.
//     stock: z.number().default(0),
//     isAvailable: z.boolean().default(false),
//     images: z.array(z.custom<FilesWithPreview>()).max(15, {
//       message: "You can only upload up to 15 images at a time.",
//     }),

//     isMain: z.boolean().default(false),
//     moreDetails: z.array(AddetionalDetailsSchema),
//   })
//   .refine((data) => data.listPrice > data.salePrice, {
//     message: "Listing price must be greater than the sales price",
//     path: ["salePrice"],
//   });

// export const CarGenerationsSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Name is too short" })
//     .max(55, { message: "Name is too long." }),
//   carModelId: z.number().default(0),
//   notes: z.string(),
// });

// export const CarInfoSchema = z.object({
//   carMakerId: z.number(),
//   carModelId: z.number(),
//   carGenerationId: z.number(),
// });

// export const CarModelSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Name is too short" })
//     .max(55, { message: "Name is too long." }),
//   carMakerId: z.number().default(0),
//   notes: z.string(),
// });

// export const CarSchema = z.object({
//   color: z.string(),
//   plateNumber: z
//     .string()
//     .min(1, { message: "Plate number is required!" })
//     .max(55, { message: "Plate number is too long." }),
//   chassisNumber: z
//     .string()
//     .min(1, { message: "Chassi number is required!" })
//     .max(55, { message: "Chassi number is too long." }),
//   motorNumber: z
//     .string()
//     .min(1, { message: "Motor number is required!" })
//     .max(55, { message: "Motor number is too long." }),
//   notes: z.string(),
//   clientId: z.number().default(0),
//   carGenerationId: z.number().default(0),
// });

// export const CreateCarMakerScehma = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Toos short" })
//     .max(55, { message: "Too long" }),
//   notes: z.string(),
//   logo: z.custom<File[]>(),
// });

// export const CreateCarModelSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Toos short" })
//     .max(55, { message: "Too long" }),
//   carMakerId: z.number(),
//   notes: z.string(),
// });

// export const CreateCarInfoSchema = z.object({
//   carMakerId: z.number(),
//   carModelId: z.number(),
//   carGenerationId: z.number(),
// });

// export const CreateProdcutImageSchema = z.object({
//   image: z.custom<File[]>(),
//   productId: z.number(),
//   isMain: z.boolean().default(false),
// });

// export const EditNameAndNote = z.object({
//   name: z
//     .string()
//     .min(3, { message: "Too short." })
//     .max(100, { message: "Too long." }),
//   carModelId: z.number(),
//   notes: z.string(),
// });

// const HslColorValues = z.object({
//   h: z.number(),
//   s: z.number(),
//   l: z.number(),
// });
// export const ServiceStatusSchema = z.object({
//   name: z
//     .string()
//     .min(4, { message: "Name is too short." })
//     .max(33, { message: "Name is too long." }),
//   colorLight: HslColorValues,
//   colorDark: HslColorValues,
//   description: z.string(),
// });

// // const phone = z.object({
// //   id: z.number().nullable(),
// //   number: z
// //     .string()
// //     .min(11, { message: "This phone number is too short" })
// //     .max(11, { message: "This phone number is too long." })
// //     .refine((phone) => validateEgyptianPhoneNumber(phone), {
// //       message: "This phone number is not valid",
// //     }),
// //   clientId: z.number().nullable(),
// // });

// const phone = z
//   .object({
//     id: z.number(),
//     number: z
//       .string()
//       .min(11, { message: "This phone number is too short" })
//       .max(11, { message: "This phone number is too long." })
//       .refine((phone) => validateEgyptianPhoneNumber(phone), {
//         message: "This phone number is not valid",
//       }),
//     clientId: z.number(),
//   })
//   .partial({ id: true, clientId: true });

// export const CreateClientSchema = z.object({
//   name: z
//     .string()
//     .min(4, { message: "Put a valid name" })
//     .max(100, { message: "The name is too long" }),
//   email: z.string().describe("Email"),
//   phones: phone.array(),
// });

// export const CreateCarSchema = z.object({
//   color: z.string(),
//   plateNumber: z
//     .string()
//     .min(1, "Plate number is required")
//     .max(30, { message: "Plate number is too long." }),
//   chassisNumber: z.string(),
//   motorNumber: z.string(),
//   notes: z.string(),
//   clientId: z.number().min(1, { message: "Every car must have an owner" }),
//   carGenerationId: z
//     .number()
//     .min(1, { message: "Every car must have car generation" }),
//   images: z.array(z.custom<FilesWithPreview>()).max(9, {
//     message: "You can only upload up to 9 images at a time.",
//   }),
// });

// export const ProductBoughtSchema = z
//   .object({
//     pricePerUnit: z.number().min(1, { message: "Price per unit is requried" }),
//     discount: z.number(),
//     count: z.number().min(1, { message: "Count is requried" }),
//     note: z.string(),
//     productId: z.number().min(1, { message: "Product is required" }),
//     productsRestockingBillId: z.string(),
//   })
//   .refine((data) => data.pricePerUnit * data.count - data.discount > 0, {
//     message: "Discount must be less than the total amount",
//     path: ["discount"],
//   });

// export const CreateProductBoughtSchema = z.object({
//   productBought: ProductBoughtSchema.array(),
//   shopName: z
//     .string()
//     .min(4, { message: "Shop name is required." })
//     .max(77, { message: "Shop name is too long." }),
// });

// export const ProductToSellSchema = z
//   .object({
//     pricePerUnit: z.number().min(1, { message: "Price is required" }),
//     discount: z.number(),
//     count: z.number().min(1, { message: "Count is required" }),
//     note: z.string(),
//     productId: z.number().min(1, { message: "Product is required" }),
//   })
//   .refine((data) => data.pricePerUnit * data.count - data.discount > 0, {
//     message: "Discount must be less than the total amount",
//     path: ["discount"],
//   });

// export const CreateServiceFeeSchema = z
//   .object({
//     categoryId: z.number().min(1, { message: "Category is required." }),
//     price: z.number().min(1, { message: "Price is required" }),
//     discount: z.number(),
//     notes: z.string(),
//   })
//   .refine((data) => data.price > data.discount, {
//     message: "Discount amount can't exceed the price amount.",
//     path: ["discount"],
//   });

// export const CreateServiceSchema = z.object({
//   clientId: z.number().min(1, { message: "Client is required." }),
//   carId: z.number().min(1, { message: "Car is required." }),
//   serviceStatusId: z
//     .number()
//     .min(1, { message: "Service status is required." }),
//   note: z.string(),
//   productsToSell: ProductToSellSchema.array(),
//   serviceFees: CreateServiceFeeSchema.array(),
//   // .min(1, {
//   //   message: "Service must have atleast on serivce fee.",
//   // }),
// });

// export const ServiceFeeSchema = z
//   .object({
//     price: z.number().min(1, { message: "Price is requried" }),
//     discount: z.number(),
//     isReturned: z.boolean(),
//     notes: z.string(),
//     categoryId: z.number().min(1, { message: "Category is requried" }),
//   })
//   .refine((data) => data.price > data.discount, {
//     message: "Discount amount can't exceed the price amount.",
//     path: ["discount"],
//   });

// export const ProductSoldSchema = z
//   .object({
//     pricePerUnit: z.number().min(1, { message: "Requried!" }),
//     discount: z.number(),
//     count: z.number().min(1, { message: "Requried!" }),
//     isReturned: z.boolean(),
//     note: z.string(),
//     productId: z.number().min(1, { message: "Required!" }),
//     serviceId: z.number().min(1, { message: "Required!" }),
//   })
//   .refine((data) => data.pricePerUnit * data.count - data.discount > 0, {
//     message: "Discount must be less than the total amount",
//     path: ["discount"],
//   });

// export const EditServiceSchema = z.object({
//   created_at: z.date(),
//   clientId: z.number().min(1, { message: "Requried" }),
//   carId: z.number().min(1, { message: "Requried" }),
//   serviceStatusId: z.number().min(1, { message: "Requried" }),
//   note: z.string(),
// });

// export interface signUpProps {
//   full_name: string;
//   email: string;
//   password: string;
//   role: "Admin" | "User";
//   token?: string | null;
// }

// // export interface User {
// //   sub?: string;
// //   jti?: string;
// //   exp?: number;
// //   iss?: string;
// //   aud?: string | string[] | undefined;
// // }

// export interface User {
//   id: string;
//   app_metadata: UserAppMetadata;
//   user_metadata: UserMetadata;
//   aud: string;
//   confirmation_sent_at?: string;
//   recovery_sent_at?: string;
//   email_change_sent_at?: string;
//   new_email?: string;
//   new_phone?: string;
//   invited_at?: string;
//   action_link?: string;
//   email?: string;
//   phone?: string;
//   created_at: string;
//   confirmed_at?: string;
//   email_confirmed_at?: string;
//   phone_confirmed_at?: string;
//   last_sign_in_at?: string;
//   role?: string;
//   updated_at?: string;
//   identities?: UserIdentity[];
//   is_anonymous?: boolean;
//   factors?: Factor[];
// }
// export interface TokenData {
//   sub: string;
//   jti: string;
//   role?: string;
//   exp: number;
//   iss: string;
//   aud: string;
// }

// export interface Category {
//   id: number;
//   name: string;
// }

// export interface ProductBrand {
//   id: number;
//   name: string;
// }

// export interface ProductType {
//   id: number;
//   name: string;
// }

// interface CarMakerData {
//   id: number;
//   name: string;
//   notes: string;
//   logo: string | null;
// }
// interface CarModelData {
//   id: number;
//   name: string;
//   notes: string;
// }

// interface CarGenerationData {
//   id: 1;
//   name: string;
//   notes: string;
// }

// export interface CarInfoProps {
//   id: number;
//   carMaker: CarMakerData;
//   carModel: CarModelData;
//   carGeneration: CarGenerationData;
// }

// export interface CarMaker {
//   id: 2;
//   name: string;
//   carModels: {
//     id: number;
//     name: string;
//     notes: string;
//     carModelId: number;
//   };
//   notes: string;
//   logo: null | string;
// }

// export interface CarModelProps {
//   id: number;
//   name: string;
//   notes: string;
//   carMaker: any;
//   carMakerId: number;
//   carGenerations: CarGenerationProps[];
// }

// export interface CarGenerationProps {
//   id: number;
//   name: string;
//   notes: string;
//   carModel: any;
//   carModelId: number;
// }

// export interface CreateProductProps {
//   name: string;
//   categoryId: number;
//   productTypeId: number;
//   productBrandId: number;
//   description: string;
//   listPrice: number;
//   carinfoId: number;
//   salePrice: number;
//   stock: number;
//   isAvailable: boolean;
//   images: FormData[];
// }

// export interface mainProductImage {
//   id: number;
//   imageUrl: string;
//   isMain: boolean;
//   productId: number;
// }

// export interface ProductImage {
//   id: number;
//   imageUrl: string;
//   isMain: boolean;
//   productId: number;
//   created_at: string;
// }

// export interface Product {
//   id: number;
//   categoryId: number;
//   created_at: string;
//   name: string;
//   description: string;
//   listPrice: number;
//   salePrice: number;
//   stock: number;
//   isAvailable: boolean;
//   productImages: ProductImage[];
//   mainProductImage: mainProductImage | null;
// }

// export interface ProductInProductToSell {
//   id: number;
//   name: string;
//   category: Category;
//   productType: ProductType;
//   productBrand: ProductBrand;
//   dateAdded: string;
//   description: string;
//   listPrice: number;
//   salePrice: number;
//   stock: number;
//   isAvailable: boolean;
//   carInfos: CarInfoProps[];
//   productImages: ProductImage[];
// }

// export interface ProductWithCategory extends Product {
//   categories: { name: string };
// }

// export interface ProductById {
//   id: number;
//   name: string;
//   categories: Category;
//   productTypes: ProductType;
//   productBrands: ProductBrand;
//   dateAdded: string;
//   description: string;
//   listPrice: number;
//   salePrice: number;
//   stock: number;
//   isAvailable: boolean;
//   carInfos: CarInfoProps[];
//   productImages: ProductImage[];
//   moreDetails: z.infer<typeof AddetionalDetailsSchema>[];
// }

// export interface EditProduct {
//   id: number;
//   name: string;
//   categoryId: number;
//   description: string;
//   listPrice: number;
//   salePrice: number;
//   stock: number;
//   isAvailable: boolean;
// }

// export interface Client {
//   id: number;
//   created_at: string;
//   name: string;
//   email: string;
//   user_id: string | null;
//   picture: string | null;
//   provider: string;
//   cars: { count: number }[];
// }

// export interface PhoneNumber {
//   id: number;
//   number: string;
//   clientId: number;
// }

// export interface ClientWithPhoneNumbers extends Client {
//   phones: PhoneNumber[];
// }

// export interface CarImage {
//   id: number;
//   imagePath: string;
//   isMain: boolean;
//   carId: number;
// }

// interface CarInformation {
//   id: number;
//   name: string;
//   notes: string;
//   carModels: {
//     id: number;
//     name: string;
//     notes: string;
//     carMakers: CarMaker;
//     carMakerId: number;
//     created_at: string;
//   };
//   carModelId: number;
//   created_at: string;
// }

// export interface CarItem {
//   id: number;
//   color: string;
//   plateNumber: string;
//   chassisNumber: string;
//   motorNumber: string;
//   notes: string;
//   carImages: CarImage[];
//   clientId: number;
//   carGenerations: CarInformation;
// }

// export interface CarItemWithClient {
//   id: number;
//   color: string;
//   plateNumber: string;
//   chassisNumber: string;
//   motorNumber: string;
//   notes: string;
//   carImages: CarImage[];
//   client: ClientWithPhoneNumbers | undefined;
//   clientId: number;
//   carInfo: {
//     id: number;
//     carMaker: CarMakerData;
//     carModel: CarModelData;
//     carGeneration: CarGenerationData;
//   };
// }

// export interface ClientById {
//   id: number;
//   name: string;
//   email: string;
//   phones: PhoneNumber[];
//   cars: CarItem[];
// }

// export interface ProductBought {
//   id: number;
//   pricePerUnit: number;
//   discount: number;
//   count: number;
//   isReturned: boolean;
//   note: string;
//   totalPriceAfterDiscount: number;
//   productName: string;
//   productId: number;
//   product: Product;
//   productsRestockingBillId: number;
//   productsRestockingBills?: { totalPrice: number };
// }

// export interface ProductBoughtData {
//   id: number;
//   shopName: string;
//   created_at: string;
//   totalPrice: number;
//   productsBought: ProductBought[];
// }

// export interface RestockingBill {
//   id: number;
//   shopName: string;
//   dateOfOrder: string;
//   productsBought: ProductBought[];
// }

// export interface productsToSellProps {
//   id: number;
//   pricePerUnit: number;
//   discount: number;
//   count: number;
//   totalPriceAfterDiscount: number;
//   isReturned: boolean;
//   note: string;
//   product: Product;
// }

// export interface ServiceStatus {
//   id: number;
//   name: string;
//   description: null | string;
// }

// export interface ProductToSell {
//   created_at: string;
//   id: number;
//   pricePerUnit: number;
//   discount: number;
//   count: number;
//   totalPriceAfterDiscount: number;
//   isReturned: boolean;
//   note: string;
//   productId: number;
//   serviceId: number;
//   product: Product;
// }

// export interface ServiceFee {
//   created_at: string;
//   id: number;
//   price: number;
//   discount: number;
//   totalPriceAfterDiscount: number;
//   isReturned: boolean;
//   notes: string;
//   categoryId: number;
//   serviceId: number;
// }

// export interface Service {
//   id: number;
//   created_at: string;
//   totalPriceAfterDiscount: number;
//   cars: CarItem;
//   serviceStatuses: ServiceStatus;
//   note: string;
//   productsToSell: ProductToSell[];
//   servicesFee: ServiceFee[];
//   clients: {
//     id: number;
//     name: string;
//     email: string;
//     phones?: PhoneNumber[];
//   };
// }

// export type EditDetails = {
//   table: {
//     title: string;
//     description: string;
//   }[];
//   title: string;
//   description: string;
//   id: number;
//   productId: number;
//   created_at: string;
// };

// export interface ServiceStatus {
//   id: number;
//   name: string;
//   colorLight: string;
//   colorDark: string;
//   description: string | null;
//   services: any[];
// }

// export interface CartItem extends ProductById {
//   quantity: number;
//   totalPrice: number;
// }

// export interface categoryResult {
//   id: number;
//   created_at: string;
//   name: string;

//   product: {
//     categoryId: number;
//     created_at: string;
//     description: string;
//     id: number;
//     isAvailable: boolean;
//     listPrice: number;
//     makerId: number | null;
//     name: string;
//     productBrandId: number;
//     productBrands: { name: string };
//     productImages: { imageUrl: string; isMain: boolean };
//     productTypeId: number;
//     salePrice: number;
//     stock: number;
//   }[];
// }

// export type ImgData = {
//   path: string;
//   name: string;
//   isMain: boolean;
//   file: FilesWithPreview | File;
// };

// export interface RejectionFiles extends FileRejection {
//   preview: string;
// }
// export type CreateProductWithImagesProps = z.infer<typeof ProductsSchema>;
// export type CarGeneration = z.infer<typeof CarGenerationsSchema>;
// export type CarInfo = z.infer<typeof CarInfoSchema>;
// export type CarModel = z.infer<typeof CarModelSchema>;
// export type Car = z.infer<typeof CarSchema>;
// export type CreateCarMaker = z.infer<typeof CreateCarMakerScehma>;
// export type CreateCarModel = z.infer<typeof CreateCarModelSchema>;
// export type CreateCarInfoSchema = z.infer<typeof CreateCarInfoSchema>;
// export type CreateClient = z.infer<typeof CreateClientSchema>;
// export type CreateCar = z.infer<typeof CreateCarSchema>;
// export type CreateProductBought = z.infer<typeof CreateProductBoughtSchema>;
// export type CreateService = z.infer<typeof CreateServiceSchema>;
// export type EditServiceFee = z.infer<typeof ServiceFeeSchema>;
// export type ProductSold = z.infer<typeof ProductSoldSchema>;
// export type EditService = z.infer<typeof EditServiceSchema>;
// export type ServiceStatusForm = z.infer<typeof ServiceStatusSchema>;
// export type HslColor = z.infer<typeof HslColorValues>;
