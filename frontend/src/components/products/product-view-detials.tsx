import Collapse, {
  CollapseButton,
  CollapseContant,
} from "@components/collapse";
import { Card } from "@components/ui/card";
import { formatCurrency } from "@lib/helper";
import { ProductById, User } from "@lib/types";
import React from "react";
import { TbBoxModel2 } from "react-icons/tb";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { MdCategory } from "react-icons/md";
import CartControls from "./cart-controls";
import MoreDetialsAccordion from "./more-details-accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { format } from "date-fns";
import NoteDialog from "@components/garage/note-dialog";
import { Badge } from "@components/ui/badge";
import { IoCarSport } from "react-icons/io5";
import { Blend, LucideCircleCheck } from "lucide-react";
import BackBtn from "./back-btn";

const ICON_SIZE = 20;
const ProdcutViewDetials = ({
  product,
  isAdmin,
  user,
}: {
  user: User | null;
  isAdmin: boolean;
  product: ProductById;
}) => {
  // const productCarInfo = product.carInfos.length ? product.carInfos[0] : null;
  const formatter = new Intl.NumberFormat("en-US");
  const carMaker = product.carMakers;
  const carModel = product.carModels;
  const carGenerations = product.generationsArr;
  return (
    <div>
      <div className=" flex   gap-5 flex-wrap  mb-24 justify-between">
        <div className=" flex items-center gap-3">
          <BackBtn />
          <Breadcrumb>
            <BreadcrumbList className=" text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/products">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/products?page=1&categoryId=${product.categories.id}`}
                  >
                    {product.categories.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/products?page=1&productTypeId=${product.productTypes.id}`}
                  >
                    {product.productTypes.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-xs  text-nowrap text-muted-foreground ml-auto text-right">
          <div>
            {product.stock ? (
              <i>
                Stock: <span>{formatter.format(product.stock)}</span>
              </i>
            ) : (
              <i>Out of stock</i>
            )}
          </div>

          {user?.user_metadata.role.toLowerCase() === "admin" && (
            <div>
              <span>
                Created at:{" "}
                <span className=" text-muted-foreground">
                  {format(product.created_at, "yyyy-MM-dd")}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <h1 className=" text-center text-3xl font-semibold tracking-wide">
        {product.name}
      </h1>

      <section className=" mt-10 space-y-36 p-2 sm:p-6">
        <div className=" text-xs items-center gap-5  flex justify-between">
          <div className="  flex  flex-nowrap  gap-1">
            {product.salePrice ? (
              <span className=" ">
                Sale price:{" "}
                <span className=" text-green-400">
                  {" "}
                  {formatCurrency(product.salePrice)}
                </span>
              </span>
            ) : null}

            <p>
              Price:{" "}
              <span
                className={` ${
                  product.salePrice
                    ? "text-red-400  line-through"
                    : "text-muted-foreground  "
                }`}
              >
                {" "}
                {formatCurrency(product.listPrice)}
              </span>
            </p>
          </div>

          <CartControls product={product} />
        </div>

        <section className=" space-y-36">
          {/* <h2 className=" text-xl font-semibold">Product information</h2> */}

          <article className=" grid    gap-3 grid-cols-1 sm:grid-cols-2  md:grid-cols-3 ">
            <Card className=" p-2  space-y-3">
              <div className=" flex items-center gap-2">
                <div className=" p-2 rounded-full    bg-dashboard-orange  text-dashboard-text-orange  flex items-center justify-center">
                  <MdCategory size={ICON_SIZE} />
                </div>
                <h2 className="  font-semibold  text-dashboard-text-orange">
                  {" "}
                  Category
                </h2>
              </div>
              <p className="   decoration-clone  break-all">
                &bull; {product.categories.name}
              </p>
            </Card>

            <Card className=" p-2    space-y-3  ">
              <div className=" flex items-center gap-2">
                <div className=" p-2 rounded-full    bg-dashboard-indigo  text-dashboard-text-indigo  flex items-center justify-center ">
                  <VscTypeHierarchySuper size={ICON_SIZE} />
                </div>
                <h2 className=" font-semibold  text-dashboard-text-indigo">
                  {" "}
                  Type
                </h2>
              </div>
              <p className="   decoration-clone  break-all">
                &bull; {product.productTypes.name}
              </p>
            </Card>

            <Card className=" p-2 space-y-3 ">
              <div className=" flex items-center gap-2">
                <div className=" p-2 rounded-full    bg-dashboard-green  text-dashboard-text-green  flex items-center justify-center ">
                  <TbBoxModel2 size={ICON_SIZE} />
                </div>
                <h2 className="  font-semibold  text-dashboard-text-green">
                  {" "}
                  Brand
                </h2>
              </div>
              <p className="   decoration-clone  break-all">
                &bull; {product.productBrands.name}
              </p>
            </Card>

            {carMaker ? (
              <Card className=" p-2 space-y-3 ">
                <div className=" flex items-center gap-2">
                  <div className=" p-2 rounded-full    bg-dashboard-blue  text-dashboard-text-blue  flex items-center justify-center ">
                    <IoCarSport size={ICON_SIZE} />
                  </div>
                  <h2 className="  font-semibold  text-dashboard-text-blue">
                    {" "}
                    Car Brand
                  </h2>
                </div>
                <div className=" flex items-center gap-2">
                  {carMaker.logo ? (
                    <img
                      className=" h-10 object-cover"
                      src={carMaker.logo}
                      alt={`${carMaker.name} Logo`}
                    />
                  ) : null}
                  <span>{carMaker.name}</span>
                  {isAdmin && carMaker?.notes && (
                    <NoteDialog content={carMaker.notes} />
                  )}
                </div>
              </Card>
            ) : null}

            {carModel ? (
              <Card className=" p-2 space-y-3 ">
                <div className=" flex items-center gap-2">
                  <div className=" p-2 rounded-full   bg-purple-200 text-purple-700  dark:bg-purple-700 dark:text-purple-200  flex items-center justify-center ">
                    <Blend size={ICON_SIZE} />
                  </div>
                  <h2 className="  font-semibold text-purple-700 dark:text-purple-200">
                    {" "}
                    Brand
                  </h2>
                </div>
                <div className=" flex items-center gap-2">
                  <span>{carModel.name}</span>

                  {isAdmin && carModel.notes && (
                    <NoteDialog content={carModel.notes} />
                  )}
                </div>
              </Card>
            ) : null}
            {carGenerations.length ? (
              <Card className=" p-2 space-y-3 ">
                <div className=" flex items-center gap-2">
                  <div
                    className=" p-2 rounded-full   bg-pink-200 text-pink-800  dark:bg-pink-900 dark:text-pink-200  flex items-center justify-center "
                    // style={{
                    //   backgroundColor: "hsl(  280 65% 60%)",
                    //   color: "hsl( 280 30% 85%)",
                    // }}
                  >
                    <LucideCircleCheck size={ICON_SIZE} />
                  </div>
                  <h2 className="  font-semibold text-pink-800  dark:text-pink-200 ">
                    {" "}
                    Generation Fits
                  </h2>
                </div>
                <div className=" flex items-center flex-wrap gap-2">
                  {carGenerations.map((gen) => (
                    <Badge
                      key={gen.id}
                      variant="secondary"
                      className=" text-nowrap"
                    >
                      {gen.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            ) : null}
          </article>
          {/* ---- */}
          <div className="">
            <h2 className=" text-xl font-semibold">DESCRIPTION</h2>
            <Collapse textLenght={1200}>
              <CollapseContant className="mt-16 text-lg ">
                {product.description}
              </CollapseContant>
              <CollapseButton arrowPositionX="right" />
            </Collapse>
          </div>
        </section>
      </section>
      {product.moreDetails.length ? (
        <MoreDetialsAccordion
          additionalDetails={product.moreDetails}
          className=" mt-14"
        />
      ) : null}
    </div>
  );
};

export default ProdcutViewDetials;
