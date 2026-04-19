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

const ProdcutViewDetials = ({
  product,
  user,
}: {
  user: User | null;
  product: ProductById;
}) => {
  // const productCarInfo = product.carInfos.length ? product.carInfos[0] : null;

  return (
    <main className=" my-10">
      <h1 className=" text-center text-3xl font-semibold tracking-wide">
        {product.name}
      </h1>
      <section className=" mt-10 space-y-7 p-6">
        <div className=" text-xs items-center  flex justify-between">
          <div className="  flex  gap-3">
            <span>
              Price:{" "}
              <span
                className={` ${
                  product.salePrice ? "text-red-400 " : "text-muted-foreground"
                }`}
              >
                {" "}
                {formatCurrency(product.listPrice)}
              </span>
            </span>

            {product.salePrice ? (
              <span className=" ">
                Sale price:{" "}
                <span className=" text-green-400">
                  {" "}
                  {formatCurrency(product.salePrice)}
                </span>
              </span>
            ) : null}
          </div>

          {user?.user_metadata.role === "Admin" && (
            <div>
              <span>
                Created at:{" "}
                <span className=" text-muted-foreground">
                  {product.dateAdded}
                </span>
              </span>
            </div>
          )}
        </div>
        <CartControls product={product} />

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
                &bull; {product.categories.name}
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
                &bull; {product.productTypes.name}
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
                &bull; {product.productBrands.name}
              </p>
            </Card>
          </div>
          {/* ---- */}
          <div>
            <h2 className=" text-xl font-semibold">Description</h2>
            <Collapse textLenght={1200}>
              <CollapseContant className="mt-16 text-lg ">
                {product.description}
              </CollapseContant>
              <CollapseButton arrowPositionX="right" />
            </Collapse>
          </div>
        </div>
      </section>
      {product.moreDetails.length ? (
        <MoreDetialsAccordion
          additionalDetails={product.moreDetails}
          className=" mt-14"
        />
      ) : null}
    </main>
  );
};

export default ProdcutViewDetials;
