"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Control,
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CarInfoProps,
  Category,
  ProductBrand,
  ProductById,
  ProductImage,
  ProductsSchema,
  ProductType,
} from "@lib/types";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import Spinner from "@components/Spinner";
import {
  createProductAction,
  editProductAction,
  revalidateProductById,
  revalidateProducts,
} from "@lib/actions/productsActions";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import { ComboBox } from "@components/combo-box";
import { MultiFileUploader } from "./multi-file-uploader";
import useObjectCompare from "@hooks/use-compare-objs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DialogComponent from "@components/dialog-component";
import {
  ArrowBigLeft,
  ArrowBigRight,
  ImageOff,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@lib/constants";
import { createProduct, editProdcut } from "@lib/services/products-services";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Progress,
  ProgressBarContainer,
  ProgressMeter,
} from "@components/progress";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  AnimatePresence,
  motion,
  useAnimate,
  usePresence,
} from "framer-motion";
import StepTwo from "./product-step-two";
import { duration } from "@mui/material";
import FullImagesGallery from "@components/full-images-gallery";
import ProdcutViewDetials from "./product-view-detials";
import Collapse, {
  CollapseButton,
  CollapseContant,
} from "@components/collapse";
import { TbBoxModel2 } from "react-icons/tb";
import { Card } from "@components/ui/card";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { MdCategory } from "react-icons/md";
import { formatCurrency } from "@lib/client-helpers";
import { BsCartDash } from "react-icons/bs";
import MoreDetailsAccordion from "./more-details-accordion";
import _ from "lodash";
import { cn } from "@lib/utils";

// Variants for slide transitions; "direction" is passed as a custom prop.
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300, // Adjust these values as needed
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

interface ProductFormProps {
  categories: Category[];
  productTypes: ProductType[];
  productBrand: ProductBrand[];
  productToEdit?: ProductById;
  useParams?: boolean;
}

type FirstStepFiedls =
  | "categoryId"
  | "productTypeId"
  | "productBrandId"
  | "listPrice";

const firstStepFields: FirstStepFiedls[] = [
  "categoryId",
  "productTypeId",
  "productBrandId",
  "listPrice",
];
// const secondStepFields

const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  productTypes,
  productBrand,
  productToEdit,
  useParams = false,
}) => {
  const searchParam = useSearchParams();
  const edit = searchParam.get("edit") ?? "";
  const [isOpen, setIsOpen] = useState(edit ? true : false);
  const [isMainImage, setIsMainImage] = useState<ProductImage | null | number>(
    null
  );
  const [deletedDetails, setDeletedDetails] = useState<number[]>([]);
  const [deletedMedia, setDeletedMedia] = useState<ProductImage[]>([]);
  const [[step, direction], setStep] = useState([0, 1]);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const maxNumOfSteps = 2;

  const handleNext = useCallback(
    (newStep: number) => {
      // Prevent overflow or underflow if needed:
      if (newStep < 0 || newStep > maxNumOfSteps) return;

      const newDirection = newStep > step ? 1 : -1;

      setStep([newStep, newDirection]);
    },
    [step, setStep]
  );

  const isMainChange =
    productToEdit?.productImages.find((image) => image.isMain === true) || null;

  const mediaUrls = useMemo(() => {
    const deletedIds = deletedMedia.map((del) => del.id);
    const mediaArr = productToEdit
      ? productToEdit.productImages.filter(
          (imageObj) => !deletedIds.includes(imageObj.id)
        )
      : [];
    return mediaArr;
  }, [deletedMedia, productToEdit]);

  const pro = {
    name: productToEdit?.name,
    categoryId: productToEdit?.categories.id,
    productTypeId: productToEdit?.productTypes.id,
    productBrandId: productToEdit?.productBrands.id,
    description: productToEdit?.description,
    listPrice: productToEdit?.listPrice,
    carinfoId: 1, //! Removed from the back end
    salePrice: productToEdit?.salePrice,
    stock: productToEdit?.stock,
    isAvailable: productToEdit?.isAvailable,
    images: [],
    moreDetails: productToEdit?.moreDetails,
    isMain: false,
  };

  const defaultValues = {
    name: pro.name || "",
    categoryId: pro.categoryId || 0,
    productTypeId: pro.productTypeId || 0,
    productBrandId: pro.productBrandId || 0,
    description: pro.description || "",
    listPrice: pro.listPrice || 0,
    carinfoId: 0, //! Removed from the back end
    salePrice: pro.salePrice || 0,
    stock: pro.stock || 0,
    isAvailable: pro.isAvailable !== undefined ? pro.isAvailable : true,
    images: [],
    moreDetails: pro.moreDetails || [],
    isMain: false,
  };
  const form = useForm<z.infer<typeof ProductsSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProductsSchema),
    defaultValues: defaultValues,
    // shouldUnregister: true,
  });

  const { images, moreDetails } = form.watch();

  const formValues = form.getValues();
  const formErrors = form.formState.errors;

  const [isFirstVaild, isSecondVaild] = useMemo(() => {
    let isFirstStepValid = true;
    let isSecondStepVaild = true;

    if (form.formState.errors.salePrice) isFirstStepValid = false;
    if (formErrors.name || formValues.name === "") isFirstStepValid = false;
    if (formValues.listPrice > formValues.salePrice && formErrors.salePrice)
      form.clearErrors("salePrice");

    for (let i = 0; i < firstStepFields.length; i++) {
      if (
        formErrors[firstStepFields[i]] ||
        formValues[firstStepFields[i]] === 0
      ) {
        isFirstStepValid = false;
        break;
      }
    }

    for (let i = 0; i < moreDetails.length; i++) {
      let itemError = false;
      const item = moreDetails[i];

      item.table.forEach((item) => {
        if (!item.title.length || !item.description.length) itemError = true;
      });

      if (!item.title.length || itemError) {
        isSecondStepVaild = false;
        break;
      }
    }

    if (formErrors.moreDetails) isSecondStepVaild = false;

    return [isFirstStepValid, isSecondStepVaild];
  }, [formValues, form, formErrors]);

  // checking if the user changet the forms data in order to enable the user to change it. if not we check if they deleted any images as shown below in the (disabled variable).
  const isEqual = useObjectCompare(defaultValues, formValues);

  // if the user didn't change the form's data nor did he delete any already uploaded images we want the submit button to be disabled to prevent any unnecessary api calls.
  const disabled =
    (step === 0 && !isFirstVaild) ||
    (step === 1 && !isSecondVaild) ||
    (step === 2 &&
      isMainChange === isMainImage &&
      isEqual &&
      !deletedMedia.length);

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (!productToEdit && images.length) {
      setIsMainImage(0);
    }
  }, [images, productToEdit]);

  useEffect(() => {
    images.forEach((file) => URL.revokeObjectURL(file.preview));
    form.reset(defaultValues);
    setStep([0, 1]);
    setDeletedDetails([]);
    setIsMainImage(
      productToEdit?.productImages.find((image) => image.isMain === true) ||
        null
    );
    if (formRef.current) formRef.current.scrollTo(0, 0);
  }, [isOpen, productToEdit?.productImages]);

  useEffect(() => {
    if (formRef.current) formRef.current.scrollTo(0, 0);
  }, [step]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    if (isLoading && productToEdit) return;
    if (edit) {
      const params = new URLSearchParams(searchParam);
      params.delete("edit");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    setIsOpen(false);

    if (isLoading) return;

    setIsMainImage(
      productToEdit?.productImages.find((image) => image.isMain === true) ||
        null
    );
    setDeletedMedia([]);
  }

  function handleDeleteMedia(productImage?: ProductImage) {
    if (productImage) setDeletedMedia((arr) => [...arr, productImage]);
  }

  function handleSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  async function onSubmit({
    name,
    categoryId,
    productBrandId,
    productTypeId,
    description,
    listPrice,
    carinfoId,
    salePrice,
    stock,
    isAvailable,
    // isMain,
    images,
    moreDetails,
  }: z.infer<typeof ProductsSchema>) {
    try {
      const isMainEdited = isMainImage && typeof isMainImage !== "number";
      const imagesToUpload = images.map((img, i) => {
        const name = `${Math.random()}-${img.name}`.replace(/\//g, "");
        const path = `${SUPABASE_URL}/storage/v1/object/public/product/${name}`;

        return {
          name,
          path,
          isMain: typeof isMainImage === "number" && isMainImage === i,
          file: img,
        };
      });
      if (productToEdit) {
        // const imagesToUpload = images.map((image, i) => {
        //   const formData = new FormData();
        //   formData.append("image", image);
        //   formData.append("productId", String(productToEdit.id));
        //   formData.append(
        //     "isMain",
        //     typeof isMainImage === "number" && isMainImage === i
        //       ? "true"
        //       : "false"
        //   );
        //   return formData;
        // });

        const isMoreDetailEqual = _.isEqual(
          productToEdit.moreDetails,
          moreDetails
        );

        const productToEditData = {
          id: productToEdit.id,
          name,
          categoryId,
          productBrandId,
          productTypeId,
          description,
          listPrice,
          salePrice,
          stock,
          isAvailable,
        };

        // Edit the product.
        await editProdcut({
          productToEdit: productToEditData,
          imagesToUpload,
          imagesToDelete: deletedMedia,
          isMain: isMainEdited ? isMainImage : null,
          prevIsMian: isMainChange,
          isEqual,
          deletedDetails,
          moreDetails: !isMoreDetailEqual ? moreDetails : [],
        });

        await revalidateProducts();
        await revalidateProductById(productToEdit.id);
        // const { error } = await editProductAction({
        //   productToEdit: productToEditData,
        //   imagesToUpload,
        //   imagesToDelete: deletedMedia,
        //   isMain: isMainEdited ? isMainImage : null,
        //   isEqual,
        // });
        // if (error) throw new Error(error);
        handleClose();
        setDeletedMedia([]);
      } else {
        // const imagesToUpload = images.length
        //   ? images.map((image, i) => {
        //       const formData = new FormData();
        //       formData.append("image", image);
        //       formData.append(
        //         "isMain",
        //         typeof isMainImage === "number" && isMainImage === i
        //           ? "true"
        //           : "false"
        //       );
        //       return formData;
        //     })
        //   : [];

        const product = await createProduct({
          name,
          categoryId,
          productTypeId,
          productBrandId,
          description,
          listPrice,
          carinfoId,
          salePrice,
          stock,
          isAvailable,
          images: imagesToUpload,
          moreDetails,
        });

        await revalidateProducts();

        // const { error } = await createProductAction({
        //   name,
        //   categoryId,
        //   productTypeId,
        //   productBrandId,
        //   description,
        //   listPrice,
        //   carinfoId,
        //   salePrice,
        //   stock,
        //   isAvailable,
        //   images: imagesToUpload,
        // });
        // const { data, error } = await supabase.from("product").insert([
        //   {
        //     name,
        //     categoryId,
        //     productTypeId,
        //     productBrandId,
        //     description,
        //     listPrice,
        //     salePrice,
        //     stock,
        //     isAvailable,
        //   },
        // ]);
        // if (error) throw new Error(error.message);
        // console.log(data);
        // console.log(images);
        // // if (!data) return;

        // // if (!images.length) return { data, error: "" };
        // const uploadPromises = images.map(async (img) => {
        //   try {
        //     const { data, error } = await supabase.storage
        //       .from("product")
        //       .upload(img.name, img);

        //     if (error) {
        //       console.log("ERROR:", error.message);
        //       throw new Error(error.message);
        //     }

        //     console.log("UPLOAD SUCCESS:", data);
        //     return data;
        //   } catch (err: any) {
        //     console.log("UPLOAD ERROR:", err);
        //   }
        // });

        // await Promise.all(uploadPromises);

        handleClose();
      }

      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={`${
              productToEdit
                ? "Product has been updated"
                : "Product has been created."
            }`}
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <DialogComponent open={isOpen} onOpenChange={handleClose}>
      <Button onClick={handleOpen} size="sm" className=" w-full">
        {productToEdit ? "Edit" : "Create"} a porduct
      </Button>
      {/* sm:p-14 pb-0 sm:pb-0 */}
      <DialogComponent.Content className="  max-h-[85vh] overflow-hidden max-w-[1050px] border border-transparent flex flex-col gap-1   p-0">
        <DialogComponent.Header className="     border-b pb-2  px-6 pt-6 sm:px-14 sm:pt-8 sm:pb-4  bg-background ">
          <DialogComponent.Title>
            {" "}
            {productToEdit ? "Update" : "Add"} Product
          </DialogComponent.Title>
          <DialogComponent.Description>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{
                  y: -15,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: 15,
                  opacity: 0,
                }}
                // initial={{
                //   scale: 0.9,
                // }}
                // animate={{
                //   scale: [0.9, 1.1, 0.9, 1],
                //   transition: { stiffness: 2, duration: 0.6 },
                // }}
                // exit={{
                //   y: 15,
                //   opacity: 0,
                //   transition: { duration: 0.2 },
                // }}
                transition={{
                  ease: "backInOut",
                }}
                className="  text-center  sm:text-left"
              >
                {step === 0 &&
                  (productToEdit
                    ? `1. Edit product '${productToEdit.name}'s essential data.`
                    : "1. Add new product's essential data.")}
                {step === 1 &&
                  (productToEdit
                    ? `2. Edit product '${productToEdit.name}'s additional description section.`
                    : "2. Add additional description to the product, **Optional**.")}
                {step === 2 &&
                  "3. Preview of what the product's page will look like."}
              </motion.div>
            </AnimatePresence>
          </DialogComponent.Description>
        </DialogComponent.Header>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "space-y-8  px-6 sm:px-14  relative  py-4 overflow-y-auto overflow-x-hidden",
              {
                " px-2 sm:px-6  ": step === maxNumOfSteps,
              }
            )}
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepOne
                  control={form.control}
                  isLoading={isLoading}
                  currStep={[step, direction]}
                  categories={categories}
                  productTypes={productTypes}
                  productBrand={productBrand}
                  isMainImage={isMainImage}
                  setIsMainImage={setIsMainImage}
                  handleDeleteMedia={handleDeleteMedia}
                  mediaUrls={mediaUrls}
                  productToEdit={productToEdit}
                  setDeletedMedia={setDeletedMedia}
                />
              )}

              {step === 1 && (
                <StepTwo
                  control={form.control}
                  moreDetails={moreDetails}
                  currStep={[step, direction]}
                  setDeletedDetails={setDeletedDetails}
                />
              )}

              {step === 2 && (
                <StepThree
                  currStep={[step, direction]}
                  isLoading={isLoading}
                  formValues={formValues}
                  mediaUrls={mediaUrls}
                  categoriesArr={categories}
                  productTypesArr={productTypes}
                  productBrandsArr={productBrand}
                />
              )}
            </AnimatePresence>
          </form>
        </Form>

        <DialogComponent.Footer className="  px-6 pt-2 pb-6 sm:px-14 sm:pb-8 sm:pt-4 border-t     bg-background bottom-0 z-50">
          {/* bg-muted-foreground/20 dark:bg-accent */}
          <div className="flex justify-between gap-4 items-center w-full">
            <div className="bg-muted-foreground/10  dark:bg-accent/20      rounded-md p-3 flex-1 ">
              <Progress value={step} maxValue={maxNumOfSteps}>
                <ProgressBarContainer className=" flex-1 border border-secondary-foreground/20 dark:border-border ">
                  <ProgressMeter />
                </ProgressBarContainer>
              </Progress>
            </div>
            <div className=" flex items-center gap-2 w-fit">
              {/* sm:w-[unset] */}
              <Button
                onClick={() => handleNext(step - 1)}
                type="reset"
                variant="secondary"
                size="sm"
                disabled={isLoading || step === 0}
                className=" w-full "
              >
                Back
              </Button>
              <Button
                size="sm"
                disabled={isLoading || disabled}
                className=" w-full "
                onClick={() => {
                  if (step < maxNumOfSteps) {
                    handleNext(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {isLoading ? (
                  <Spinner className=" h-full" />
                ) : step < maxNumOfSteps ? (
                  "Next"
                ) : productToEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </DialogComponent.Footer>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

/// Step one Products details. --------------------------------------

export const transition = {
  x: { type: "spring", stiffness: 300, damping: 26, duration: 4 },
  opacity: { duration: 0.5 },
};

interface StepOneProps {
  control: Control<z.infer<typeof ProductsSchema>>;
  isLoading: boolean;
  categories: Category[];
  productTypes: ProductType[];
  productBrand: ProductBrand[];
  isMainImage: number | ProductImage | null;
  mediaUrls: ProductImage[];
  productToEdit?: ProductById;
  currStep: number[];
  handleDeleteMedia(productImage?: ProductImage): void;
  setIsMainImage: React.Dispatch<
    React.SetStateAction<number | ProductImage | null>
  >;
  setDeletedMedia: React.Dispatch<React.SetStateAction<ProductImage[]>>;
}

function StepOne({
  currStep,
  control,
  isLoading,
  categories,
  productBrand,
  productTypes,
  isMainImage,
  setIsMainImage,
  handleDeleteMedia,
  mediaUrls,
  setDeletedMedia,
  productToEdit,
}: StepOneProps) {
  const [step, direction] = currStep;
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="  space-y-7"
    >
      <FormField
        disabled={isLoading}
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input disabled={isLoading} placeholder="name" {...field} />
            </FormControl>
            <FormDescription>Enter the name of the product.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className=" flex  flex-col gap-2 sm:flex-row">
        <FormField
          disabled={isLoading}
          control={control}
          name="listPrice"
          render={({ field }) => (
            <FormItem className=" w-full">
              <FormLabel>List price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (/^\d*$/.test(inputValue)) {
                      field.onChange(Number(inputValue));
                    }
                  }}
                  placeholder="List price..."
                  // {...field}
                />
              </FormControl>
              <FormDescription>Enter the listing price.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isLoading}
          control={control}
          name="salePrice"
          render={({ field }) => (
            <FormItem className=" w-full">
              <FormLabel>Sale price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (/^\d*$/.test(inputValue)) {
                      field.onChange(Number(inputValue));
                    }
                  }}
                  placeholder="Sale price"
                  // {...field}
                />
              </FormControl>
              <FormDescription>Enter the discounted price.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className=" flex  flex-col gap-2 sm:flex-row">
        <FormField
          disabled={isLoading}
          control={control}
          name="stock"
          render={({ field }) => (
            <FormItem className=" w-full">
              <FormLabel>Stock available</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (/^\d*$/.test(inputValue)) {
                      field.onChange(Number(inputValue));
                    }
                  }}
                  placeholder="Stock"
                  // {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the amount of stock available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isLoading || !categories.length}
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className=" w-full ">
              <FormLabel>category</FormLabel>
              <FormControl className=" ">
                <ComboBox
                  disabled={isLoading || !categories.length}
                  options={categories}
                  value={field.value}
                  setValue={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Enter what category does the product belong to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className=" flex  flex-col gap-2 sm:flex-row">
        <FormField
          disabled={isLoading || !productBrand.length}
          control={control}
          name="productBrandId"
          render={({ field }) => (
            <FormItem className=" w-full">
              <FormLabel>Product brand</FormLabel>
              <FormControl>
                <ComboBox
                  disabled={isLoading || !productBrand.length}
                  options={productBrand}
                  value={field.value}
                  setValue={field.onChange}
                />
              </FormControl>
              <FormDescription>Enter the brand of the product.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isLoading || !productTypes.length}
          control={control}
          name="productTypeId"
          render={({ field }) => (
            <FormItem className=" w-full">
              <FormLabel>Product type</FormLabel>
              <FormControl>
                <ComboBox
                  disabled={isLoading || !productTypes.length}
                  options={productTypes}
                  value={field.value}
                  setValue={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Enter what type of product it is.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        disabled={isLoading}
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                disabled={isLoading}
                cols={6}
                placeholder="Description"
                {...field}
              />
            </FormControl>
            <FormDescription>Describe the product.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        disabled={isLoading}
        control={control}
        name="images"
        render={({ field }) => (
          <FormItem className=" w-full">
            <FormLabel>Product images</FormLabel>
            <FormControl>
              <MultiFileUploader
                isMainImage={isMainImage}
                setIsMainImage={setIsMainImage}
                disabled={isLoading}
                handleDeleteMedia={handleDeleteMedia}
                selectedFiles={field.value}
                fieldChange={field.onChange}
                mediaUrl={mediaUrls}
              />
            </FormControl>
            <FormDescription className=" flex items-center justify-between">
              <span> Add images related to the product.</span>{" "}
              <div className=" flex items-center gap-2">
                <span className=" text-xs ">
                  Images: {field.value.length + mediaUrls?.length}
                </span>
                <Button
                  disabled={
                    (!field.value.length && !mediaUrls.length) || isLoading
                  }
                  onClick={() => {
                    field.onChange([]);
                    setIsMainImage(null);
                    if (productToEdit)
                      setDeletedMedia(productToEdit.productImages);
                  }}
                  type="button"
                  variant="destructive"
                  className=" p-0 w-6 h-6"
                >
                  {" "}
                  <Trash2 className=" w-4 h-4 shrink-0" />
                </Button>
              </div>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        disabled={isLoading}
        control={control}
        name="isAvailable"
        render={({ field }) => (
          <FormItem className="flex flex-row h-fit  items-center justify-between rounded-lg border p-3 shadow-sm w-full">
            <div className="space-y-0.5 ">
              <FormLabel>Availability</FormLabel>
              <FormDescription>Is the product available?.</FormDescription>
            </div>
            <FormControl>
              <Switch
                disabled={isLoading}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-readonly
              />
            </FormControl>
          </FormItem>
        )}
      />
    </motion.div>
  );
}

/// Step 2 ---------------------------------------------------------------------------

/// Step 3

interface StepThreeProps {
  currStep: number[];
  isLoading: boolean;
  mediaUrls: ProductImage[];
  categoriesArr: Category[];
  productTypesArr: ProductType[];
  productBrandsArr: ProductBrand[];
  formValues: z.infer<typeof ProductsSchema>;
}

function StepThree({
  currStep,
  formValues,
  mediaUrls,
  categoriesArr,
  productBrandsArr,
  productTypesArr,
  isLoading,
}: StepThreeProps) {
  const [step, direction] = currStep;

  const images = formValues.images.map((image) => image.preview);
  const urls = mediaUrls.map((image) => image.imageUrl);
  const viewedImages = [...urls, ...images];
  const categories = categoriesArr.find(
    (cat) => cat.id === formValues.categoryId
  );
  const productTypes = productTypesArr.find(
    (type) => type.id === formValues.productTypeId
  );
  const productBrands = productBrandsArr.find(
    (brand) => brand.id === formValues.productBrandId
  );

  // const date = new Date();

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      // initial={{
      //   opacity: 0,
      //   x: direction < 0 ? -350 : 350,
      // }}
      // animate={{
      //   opacity: 1,
      //   x: 0,
      // }}
      // exit={{
      //   opacity: 0,
      //   x: direction < 0 ? -350 : 350,
      // }}
      className={` relative border-2 p-4  rounded-xl border-dashed ${
        isLoading && "pointer-events-none"
      }`}
    >
      {viewedImages.length ? (
        <FullImagesGallery images={viewedImages} className="  !h-[50vh]" />
      ) : (
        <div className=" h-full flex items-center justify-center  bg-foreground/10  font-semibold text-xl py-5 gap-3">
          <ImageOff className=" w-10 h-10" /> No images.
        </div>
      )}

      <div className=" text-xs  text-muted-foreground my-4 text-right px-3">
        {formValues.stock ? (
          <i>
            Stock: <span>{formValues.stock}</span>
          </i>
        ) : (
          <i>Out of stock</i>
        )}
      </div>

      <main className=" my-10">
        <h1 className=" text-center text-3xl font-semibold tracking-wide">
          {formValues.name}
        </h1>
        <section className=" mt-10 space-y-7 p-6">
          <div className=" text-xs items-center  flex justify-between">
            <div className="  flex  gap-3">
              <span>
                Listing price:{" "}
                <span className=" text-red-400">
                  {" "}
                  {formatCurrency(formValues.listPrice)}
                </span>
              </span>

              <span className=" ">
                Sales price:{" "}
                <span className=" text-green-400">
                  {" "}
                  {formatCurrency(formValues.salePrice)}
                </span>
              </span>
            </div>
          </div>
          <CartDummy stock={formValues.stock} />

          <div className=" space-y-14">
            <h2 className=" text-xl font-semibold">Product information</h2>
            <div className=" grid  gap-3 grid-cols-1 sm:grid-cols-2  md:grid-cols-3 ">
              <Card className=" p-5 h-fit">
                <div className=" flex items-center gap-2">
                  <div className=" w-14 h-14 rounded-full    bg-dashboard-orange  text-dashboard-text-orange  flex items-center justify-center mb-3">
                    <MdCategory size={30} />
                  </div>
                  <h2 className=" text-2xl font-semibold  text-dashboard-text-orange">
                    {" "}
                    Category
                  </h2>
                </div>
                <p className="   decoration-clone  break-all">
                  &bull; {categories?.name}
                </p>
              </Card>

              <Card className=" p-5 h-fit">
                <div className=" flex items-center gap-2">
                  <div className=" w-14 h-14 rounded-full    bg-dashboard-indigo  text-dashboard-text-indigo  flex items-center justify-center mb-3">
                    <VscTypeHierarchySuper size={30} />
                  </div>
                  <h2 className=" text-2xl font-semibold  text-dashboard-text-indigo">
                    {" "}
                    Type
                  </h2>
                </div>
                <p className="   decoration-clone  break-all">
                  &bull; {productTypes?.name}
                </p>
              </Card>

              <Card className=" p-5 h-fit">
                <div className=" flex items-center gap-2">
                  <div className=" w-14 h-14 rounded-full    bg-dashboard-green  text-dashboard-text-green  flex items-center justify-center mb-3">
                    <TbBoxModel2 size={30} />
                  </div>
                  <h2 className=" text-2xl font-semibold  text-dashboard-text-green">
                    {" "}
                    Brand
                  </h2>
                </div>
                <p className="   decoration-clone  break-all">
                  &bull; {productBrands?.name}
                </p>
              </Card>
            </div>
            {/* ---- */}
            <div>
              <h2 className=" text-xl font-semibold">Description</h2>
              <Collapse textLenght={1200}>
                <CollapseContant className="mt-16 text-lg ">
                  {formValues.description}
                </CollapseContant>
                <CollapseButton arrowPositionX="right" />
              </Collapse>
            </div>
          </div>
          <MoreDetailsAccordion additionalDetails={formValues.moreDetails} />
        </section>
      </main>
    </motion.div>
  );
}

function CartDummy({ stock }: { stock: number }) {
  const [value, setValue] = useState(0);
  return (
    <motion.div className=" flex item-center justify-end gap-2 ">
      <motion.div layout>
        <AnimatePresence>
          {value ? (
            <div className=" flex items-center  transition-opacity overflow-hidden duration-300   gap-2">
              <Button
                onClick={() => setValue((value) => value - 1)}
                size="sm"
                className="  p-2 h-fit "
                type="button"
              >
                <Minus size={17} />
              </Button>

              <motion.span
                key={value}
                initial={{ opacity: 0, translateY: -7 }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  translateY: 7,
                }}
              >
                {value}
              </motion.span>

              <Button
                disabled={value === stock}
                onClick={() => setValue((value) => value + 1)}
                size="sm"
                className="  p-2 h-fit "
                type="button"
              >
                <Plus size={17} />
              </Button>
            </div>
          ) : (
            <motion.button
              onClick={() => setValue(1)}
              className={
                "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs "
              }
              type="button"
            >
              Add to cart
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {value && (
          <motion.button
            layout
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setValue(0)}
            className=" inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90 h-8 rounded-md px-3 text-xs"
          >
            <BsCartDash size={19} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Progress bar

interface ProgressBarProps {
  currStep: number;
  setcurrStep: React.Dispatch<React.SetStateAction<number>>;
}

function ProgressBar({ currStep, setcurrStep }: ProgressBarProps) {
  const maxNumOfSteps = 3;
  const handleNext = useCallback(() => {
    if (currStep < maxNumOfSteps) {
      setcurrStep((curStep) => curStep + 1);
    }
  }, [currStep, setcurrStep]);

  const handlePrev = useCallback(() => {
    if (currStep > 0) {
      setcurrStep((curStep) => curStep - 1);
    }
  }, [currStep, setcurrStep]);

  return (
    <div className=" flex items-center gap-5">
      <Button size="sm" onClick={handlePrev} disabled={currStep === 0}>
        <ArrowBigLeft />
      </Button>

      <Progress value={currStep} maxValue={maxNumOfSteps}>
        <ProgressBarContainer className=" flex-1">
          <ProgressMeter />
        </ProgressBarContainer>
      </Progress>

      <Button
        size="sm"
        onClick={handleNext}
        disabled={currStep === maxNumOfSteps}
      >
        <ArrowBigRight />
      </Button>
    </div>
  );
}

export default ProductForm;
