import Collapse, {
  CollapseButton,
  CollapseContant,
} from "@/components/collapse"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/helper"

import React from "react"
import { TbBoxModel2 } from "react-icons/tb"
import { VscTypeHierarchySuper } from "react-icons/vsc"
import { MdCategory } from "react-icons/md"
import CartControls from "./cart-controls"
import MoreDetialsAccordion from "./more-details-accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { format } from "date-fns"
import NoteDialog from "@/components/garage/note-dialog"
import { Badge } from "@/components/ui/badge"
import { IoCarSport } from "react-icons/io5"
import { Blend, LucideCircleCheck } from "lucide-react"
import BackBtn from "./back-btn"
import type { ProductWithDetails } from "@/types"
import { Link } from "react-router"

const ICON_SIZE = 20
const ProdcutViewDetials = ({
  product,
  isAdmin,
  user,
}: {
  user: null
  isAdmin: boolean
  product: ProductWithDetails
}) => {
  // const productCarInfo = product.carInfos.length ? product.carInfos[0] : null;
  const formatter = new Intl.NumberFormat("en-US")
  const carMaker = product.carMaker
  const carModel = product.carModel
  const carGenerations = product.generations
  return (
    <div>
      <div className="mb-24 flex flex-wrap justify-between gap-5">
        <div className="flex items-center gap-3">
          <BackBtn />
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/products">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/products?page=1&categoryId=${product.category._id}`}
                  >
                    {product.category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/products?page=1&productTypeId=${product.productType._id}`}
                  >
                    {product.productType.name}
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
        <div className="ml-auto text-right text-xs text-nowrap text-muted-foreground">
          <div>
            {product.stock ? (
              <i>
                Stock: <span>{formatter.format(product.stock)}</span>
              </i>
            ) : (
              <i>Out of stock</i>
            )}
          </div>

          {/* {user?.user_metadata.role.toLowerCase() === "admin" && ( */}
          <div>
            <span>
              Created at:{" "}
              <span className="text-muted-foreground">
                {format(product.createdAt, "yyyy-MM-dd")}
              </span>
            </span>
          </div>
          {/* )} */}
        </div>
      </div>

      <h1 className="text-center text-3xl font-semibold tracking-wide">
        {product.name}
      </h1>

      <section className="mt-10 space-y-36 p-2 sm:p-6">
        <div className="flex items-center justify-between gap-5 text-xs">
          <div className="flex flex-nowrap gap-1">
            {product.salePrice ? (
              <span className=" ">
                Sale price:{" "}
                <span className="text-green-400">
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
                    ? "text-red-400 line-through"
                    : "text-muted-foreground"
                }`}
              >
                {" "}
                {formatCurrency(product.listPrice)}
              </span>
            </p>
          </div>

          <CartControls product={product} />
        </div>

        <section className="space-y-36">
          {/* <h2 className=" text-xl font-semibold">Product information</h2> */}

          <article className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Card className="space-y-3 p-2">
              <div className="flex items-center gap-2">
                <div className="bg-dashboard-orange text-dashboard-text-orange flex items-center justify-center rounded-full p-2">
                  <MdCategory size={ICON_SIZE} />
                </div>
                <h2 className="text-dashboard-text-orange font-semibold">
                  {" "}
                  Category
                </h2>
              </div>
              <p className="decoration-clone break-all">
                &bull; {product.category.name}
              </p>
            </Card>

            <Card className="space-y-3 p-2">
              <div className="flex items-center gap-2">
                <div className="bg-dashboard-indigo text-dashboard-text-indigo flex items-center justify-center rounded-full p-2">
                  <VscTypeHierarchySuper size={ICON_SIZE} />
                </div>
                <h2 className="text-dashboard-text-indigo font-semibold">
                  {" "}
                  Type
                </h2>
              </div>
              <p className="decoration-clone break-all">
                &bull; {product.productType.name}
              </p>
            </Card>

            <Card className="space-y-3 p-2">
              <div className="flex items-center gap-2">
                <div className="bg-dashboard-green text-dashboard-text-green flex items-center justify-center rounded-full p-2">
                  <TbBoxModel2 size={ICON_SIZE} />
                </div>
                <h2 className="text-dashboard-text-green font-semibold">
                  {" "}
                  Brand
                </h2>
              </div>
              <p className="decoration-clone break-all">
                &bull; {product.productBrand.name}
              </p>
            </Card>

            {carMaker ? (
              <Card className="space-y-3 p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-dashboard-blue text-dashboard-text-blue flex items-center justify-center rounded-full p-2">
                    <IoCarSport size={ICON_SIZE} />
                  </div>
                  <h2 className="text-dashboard-text-blue font-semibold">
                    {" "}
                    Car Brand
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {carMaker.logo ? (
                    <img
                      className="h-10 object-cover"
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
              <Card className="space-y-3 p-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-full bg-purple-200 p-2 text-purple-700 dark:bg-purple-700 dark:text-purple-200">
                    <Blend size={ICON_SIZE} />
                  </div>
                  <h2 className="font-semibold text-purple-700 dark:text-purple-200">
                    {" "}
                    Brand
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span>{carModel.name}</span>

                  {isAdmin && carModel.notes && (
                    <NoteDialog content={carModel.notes} />
                  )}
                </div>
              </Card>
            ) : null}
            {carGenerations.length ? (
              <Card className="space-y-3 p-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-full bg-pink-200 p-2 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                    // style={{
                    //   backgroundColor: "hsl(  280 65% 60%)",
                    //   color: "hsl( 280 30% 85%)",
                    // }}
                  >
                    <LucideCircleCheck size={ICON_SIZE} />
                  </div>
                  <h2 className="font-semibold text-pink-800 dark:text-pink-200">
                    {" "}
                    Generation Fits
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {carGenerations.map((gen) => (
                    <Badge
                      key={gen._id}
                      variant="secondary"
                      className="text-nowrap"
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
            <h2 className="text-xl font-semibold">DESCRIPTION</h2>
            <Collapse textLenght={1200}>
              <CollapseContant className="mt-16 text-lg">
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
          className="mt-14"
        />
      ) : null}
    </div>
  )
}

export default ProdcutViewDetials
