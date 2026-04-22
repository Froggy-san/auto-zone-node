"use client";
import { zodResolver } from "@hookform/resolvers/zod";

import { CategoryProps, ProductType, ProductTypeSchema } from "@lib/types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useObjectCompare from "@hooks/use-compare-objs";
import { Input } from "@components/ui/input";
import { FileUploader } from "@components/file-uploader";
import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import {
  createProductType,
  editProductType,
} from "@lib/services/product-types";
import { AnimatePresence, motion } from "framer-motion";
const ProFormSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120, // Adjust these values as needed
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  // exit: (direction: number) => ({ opacity: 0, transition: { duration: 0.3 } }),
};

const DEFAULT_COUNTER = 3;

const ProductTypeForm = ({
  productTypeToEdit,
  showBtn,
  open,
  setOpen,
  relatedCategory,
}: {
  showBtn?: boolean;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  productTypeToEdit?: ProductType;
  relatedCategory: CategoryProps;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTabArr, setSelectedTab] = useState<[number, number]>([0, 1]);
  const [externalImg, setExternalImg] = useState<
    { index: number; image: string }[]
  >([{ index: 0, image: "" }]);
  const [counter, setCounter] = useState(0);

  const [selectedTab, direction] = selectedTabArr;
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const diaOpen = open !== undefined ? open : isOpen;
  const defaultValues = {
    insert: [
      {
        name: productTypeToEdit?.name || "",
        categoryId: productTypeToEdit?.categoryId || relatedCategory.id || 0,
        image: [],
      },
    ],
  };

  const form = useForm<z.infer<typeof ProductTypeSchema>>({
    resolver: zodResolver(ProductTypeSchema),
    defaultValues,
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    { control: form.control, name: "insert" }
  );

  const { insert: insertArry } = form.watch();

  const isValid = insertArry.every((subCat) => subCat.name?.length > 3);

  const currentTab: FieldArrayWithId<
    {
      insert: {
        image: File[];
        name: string;
        categoryId: number;
      }[];
    },
    "insert",
    "id"
  > = fields[selectedTab];

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const isLoading = form.formState.isSubmitting;
  const isNext = selectedTab < fields.length - 1;
  const isPrev = selectedTab > 0;

  const handleRemove = useCallback(() => {
    // Revoke the image's url inside the removed item.
    const imageBlob = externalImg[selectedTab].image;
    URL.revokeObjectURL(imageBlob);

    // Remove the image data from the external images array.
    setExternalImg((prevArr) =>
      prevArr
        .filter((item) => item.index !== selectedTab)
        .map((item, index) => {
          return { ...item, index };
        })
    );
    // Remove the item from the array of data.
    remove(selectedTab);

    // Focus on the next or the previous
    if (isNext) {
      setSelectedTab(([curr, dir]) => [curr, 1]);
    } else {
      setSelectedTab(([curr, dir]) => [curr - 1, -1]);
    }
  }, [
    selectedTab,
    externalImg,
    setExternalImg,
    setSelectedTab,
    remove,
    isNext,
  ]);

  const handleNext = useCallback(
    (newTab: number) => {
      // Prevent overflow or underflow if needed:
      if (newTab < 0 || newTab > fields.length) return;

      if (newTab === 0) setCounter(DEFAULT_COUNTER);
      if (newTab > 0 && counter > 0) setCounter(0);
      const direction = newTab > selectedTab ? 1 : -1;

      setSelectedTab([newTab, direction]);
    },
    [selectedTab, setSelectedTab, counter, setCounter]
  );

  const handleOpenChange = useCallback(() => {
    setOpen?.((open) => !open);
    setIsOpen((open) => !open);
  }, [setOpen, setIsOpen]);

  // Reset the default values upon closing or opening the dialog.
  useEffect(() => {
    form.reset(defaultValues);
    setSelectedTab([0, 1]);
    setCounter(0);
    externalImg.forEach((item) => URL.revokeObjectURL(item.image));
    setExternalImg([{ index: 0, image: "" }]);
  }, [diaOpen]);

  // Set the counter every time the user is at the last tab.
  useEffect(() => {
    if (counter > 0) {
      const interval = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 500); // 500 ms

      return () => clearInterval(interval);
    }
  }, [counter]);

  // Scroll up on selecting a new tab.
  // useEffect(() => {
  //   if (containerRef.current) containerRef.current.scrollTo(0, 0);
  //   if (formRef.current) formRef.current.scrollTo(0, 0); //! This fixs a bug in the animation for some reason. you can remove it and see what happens if it's not here.
  // }, [selectedTab, containerRef.current]);

  async function handleSubmit(productType: z.infer<typeof ProductTypeSchema>) {
    try {
      if (productTypeToEdit) {
        // Editing process

        const typeToEdit = productType.insert[0];
        await editProductType({
          ...typeToEdit,
          id: productTypeToEdit.id,
          imageToDelete: productTypeToEdit.image,
        });
      } else {
        await createProductType(productType);
      }
      handleOpenChange();

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="A new category has been created." />
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
    <Dialog open={diaOpen} onOpenChange={handleOpenChange}>
      {showBtn ? (
        <DialogTrigger asChild>
          <Button size="sm">
            {productTypeToEdit ? "Edit Product Type" : "Create Product Type"}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent
        ref={containerRef}
        className=" max-h-[76vh] p-3 sm:p-6   gap-0  overflow-y-auto max-w-[550px]"
      >
        <DialogHeader className=" border-b pb-4">
          <DialogTitle>
            {productTypeToEdit ? (
              <span>
                Edit product type<span>&#46;</span>
              </span>
            ) : (
              <span>
                Create a new product type<span>&#46;</span>
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {`Add the details of the sub-category number (${selectedTab + 1})`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="  relative overflow-x-hidden   "
          >
            <AnimatePresence mode="wait">
              {productTypeToEdit && (
                <motion.div
                  key={currentTab.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  // exit="exit"
                  // transition={{ ease: "backOut", duration: 0.6 }}
                  className=" space-y-4 py-4 px-2 "
                >
                  <div className=" flex  items-start  gap-2">
                    {relatedCategory && (
                      <FormItem className=" w-full mb-auto">
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <div className=" flex  border rounded-lg text-xs p-1 min-h-9 h-fit  items-center gap-4  pointer-events-none">
                            {relatedCategory.image ? (
                              <img
                                src={relatedCategory.image}
                                alt={`${relatedCategory.name} image`}
                                className=" h-8 object-contain"
                              />
                            ) : null}{" "}
                            <span>{relatedCategory.name}</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the name of the main category.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}

                    <FormField
                      disabled={isLoading}
                      control={form.control}
                      name={`insert.${selectedTab}.name`}
                      render={({ field }) => (
                        <FormItem className=" w-full mb-auto">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={isLoading}
                              placeholder="name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the name of the related sub-category.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name={`insert.${selectedTab}.image`}
                    render={({ field }) => {
                      // const image = currentTab.image.length
                      //   ? URL.createObjectURL(currentTab.image[0])
                      //   : productTypeToEdit?.image || "";

                      const image = externalImg[selectedTab];
                      return (
                        <FormItem>
                          <FormLabel>Sub Category Image</FormLabel>
                          <FormControl>
                            <FileUploader
                              mediaUrl={
                                productTypeToEdit?.image
                                  ? productTypeToEdit.image
                                  : ""
                              }
                              externalImg={image}
                              setExternalImgState={setExternalImg}
                              fieldChange={field.onChange}
                              imageStyle="    object-contain max-h-[350px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Add a sub-category image.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  {selectedTab > 0 && (
                    <div
                      key="delete-button"
                      className=" flex items-center justify-center my-2"
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemove}
                        className=" w-full"
                      >
                        Remove {selectedTab + 1}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/*  */}
            {currentTab && !productTypeToEdit ? (
              <motion.div
                key={currentTab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className=" space-y-4 py-4 px-2  "
              >
                <div className=" flex  items-start  gap-2">
                  {relatedCategory && (
                    <FormItem className=" w-full mb-auto">
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <div className=" flex  border rounded-lg text-xs p-1 min-h-9 h-fit  items-center gap-4  pointer-events-none">
                          {relatedCategory.image ? (
                            <img
                              src={relatedCategory.image}
                              alt={`${relatedCategory.name} image`}
                              className=" h-8 object-contain"
                            />
                          ) : null}{" "}
                          <span>{relatedCategory.name}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the name of the main category.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}

                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name={`insert.${selectedTab}.name`}
                    render={({ field }) => (
                      <FormItem className=" w-full mb-auto">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the name of the related sub-category.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name={`insert.${selectedTab}.image`}
                  render={({ field }) => {
                    // const image = currentTab.image.length
                    //   ? URL.createObjectURL(currentTab.image[0])
                    //   : productTypeToEdit?.image || "";

                    const image = externalImg[selectedTab];
                    return (
                      <FormItem>
                        <FormLabel>Sub Category Image</FormLabel>
                        <FormControl>
                          <FileUploader
                            externalImg={image}
                            setExternalImgState={setExternalImg}
                            fieldChange={field.onChange}
                            imageStyle="    object-contain max-h-[350px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Add a sub-category image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                {selectedTab > 0 && (
                  <div
                    key="delete-button"
                    className=" flex items-center justify-center my-2"
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemove}
                      className=" w-full"
                    >
                      Remove {selectedTab + 1}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : null}

            <div
              key="footer"
              className=" gap-2 flex items-center justify-between select-none border-t pt-4"
            >
              <AnimatePresence mode="wait">
                {!productTypeToEdit && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=" w-fit h-fit"
                  >
                    <Button
                      onClick={() => {
                        append({
                          name: "",
                          categoryId: relatedCategory.id || 0,
                          image: [],
                        });
                        setExternalImg((prevArr) => [
                          ...prevArr,
                          { index: prevArr.length, image: "" },
                        ]);
                        setSelectedTab([fields.length, 1]);
                      }}
                      type="button"
                      size="sm"
                      className=" w-full sm:w-fit"
                      disabled={isLoading || !isValid}
                    >
                      Add Another
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className=" flex flex-1  ml-auto flex-row items-center justify-end  gap-2 select-none">
                {!productTypeToEdit && (
                  <Button
                    onClick={() => {
                      if (isPrev) {
                        handleNext(selectedTab - 1);
                      } else {
                        setOpen?.(false);
                        setIsOpen(false);
                      }
                    }}
                    disabled={isLoading || counter !== 0}
                    type={selectedTab > 0 ? "button" : "reset"}
                    variant="secondary"
                    size="sm"
                    className=" w-full sm:w-[unset]"
                  >
                    {selectedTab > 0 ? (
                      "Back"
                    ) : (
                      <span>Cancel {counter !== 0 && counter}</span>
                    )}
                  </Button>
                )}
                <Button
                  disabled={isLoading || !isNext}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleNext(selectedTab + 1)}
                  className=" w-full sm:w-fit"
                >
                  Next
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || isEqual || !isValid}
                  className=" w-full sm:w-[unset]"
                >
                  {isLoading ? (
                    <Spinner className=" h-full" />
                  ) : productTypeToEdit ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductTypeForm;
