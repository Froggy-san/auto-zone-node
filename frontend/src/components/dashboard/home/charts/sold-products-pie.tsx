import * as React from "react";
import { Label, Pie, PieChart, TooltipProps } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Service } from "@lib/types";
import { formatCurrency } from "@lib/client-helpers";
import { cn } from "@lib/utils";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";
import { Button } from "@components/ui/button";
import { Check, Ellipsis } from "lucide-react";
import { GiTumbleweed } from "react-icons/gi";
import SoldMoreDetails from "./sold-more-details";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },

  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "var(--dashboard-orange)",
];

interface ProductPie {
  id: number;
  productName: string;
  productImage: string;
  pricePerUnit: number;
  totalCount: number;
  totalDiscount: number;
  totalPriceAfterDiscount: number;
}

interface Props {
  productsPieData: ProductPie[];
  date: (string | Date | undefined)[];
  description: string;
}
export function SoldProductsPie({ productsPieData, date, description }: Props) {
  const [sortDataBy, setSortDataBy] = React.useState<
    "totalPriceAfterDiscount" | "totalCount"
  >("totalCount");
  const isBigScreen = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  // const flatData = salesData.flat();
  // const products = flatData.map((item) => item.productsToSell).flat();

  // const productIds = Array.from(new Set(products.map((pro) => pro.product.id)));

  // const productsPie = React.useMemo(() => {
  //   return productIds
  //     .map((id, index) => {
  //       const pro = products.find((item) => item.product.id === id);
  //       const proImages = pro?.product.productImages;
  //       const image: string | null = proImages?.length
  //         ? proImages?.find((img) => img.isMain)?.imageUrl ||
  //           proImages[0].imageUrl
  //         : null;
  //       return products
  //         .filter((pro) => pro.product.id === id)
  //         .reduce(
  //           (acc, currItem) => {
  //             acc.totalCount += currItem.count;
  //             acc.totalDiscount += currItem.discount * currItem.count;
  //             acc.totalPriceAfterDiscount += currItem.totalPriceAfterDiscount;
  //             return acc;
  //           },
  //           {
  //             id: id,
  //             productName: pro?.product.name,
  //             productImage: image,
  //             pricePerUnit: pro?.pricePerUnit,
  //             totalCount: 0,
  //             totalDiscount: 0,
  //             // fill: colors[index],
  //             totalPriceAfterDiscount: 0,
  //           },
  //         );
  //     })
  //     .sort((a, b) => b[sortDataBy] - a[sortDataBy])
  //     .map((item, index) => {
  //       return { ...item, fill: colors[index] || "hsl(0deg 0% 50.2%)" };
  //     });
  // }, [flatData]);

  const productsPie = productsPieData
    .sort((a, b) => b[sortDataBy] - a[sortDataBy])
    .map((item, index) => {
      return { ...item, fill: colors[index] || "hsl(0deg 0% 50.2%)" };
    });
  // If there is more than 6 items we want to grop the rest into the others group.
  const productMoreThanSix = React.useMemo(() => {
    if (productsPie.length > 6) {
      const firstSix = productsPie.slice(0, 6).map((item, index) => {
        return { ...item, fill: colors[index] };
      });
      const fromSix = productsPie.slice(6);

      const theTotalsFromSix = fromSix.reduce(
        (acc, currItem) => {
          acc.totalCount += currItem.totalCount;
          acc.totalDiscount += currItem.totalDiscount;
          acc.totalPriceAfterDiscount += currItem.totalPriceAfterDiscount;

          return acc;
        },
        {
          productName: "Other",
          pricePerUnit: 0,
          totalCount: 0,
          totalDiscount: 0,
          totalPriceAfterDiscount: 0,
        },
      );
      return [...firstSix, theTotalsFromSix];
    } else return [];
  }, [productsPie]);

  const productsSoldData = productMoreThanSix.length
    ? productMoreThanSix
    : productsPie;

  const finalTotals = React.useMemo(() => {
    return productsSoldData.reduce(
      (acc, curr) => {
        acc.totalPriceAfterDiscount += curr.totalPriceAfterDiscount;
        acc.totalCount += curr.totalCount;

        return acc;
      },
      { totalCount: 0, totalPriceAfterDiscount: 0 },
    );
  }, [productsSoldData]);
  // const config : any = {
  //   soldProducts: {
  //     label: "Sold Products",
  //   },
  // };

  // productsSoldData.forEach((pro,index) => {
  //   const label = pro.productName || `pro${index}`;

  //   config[label] = {
  //      label: label,
  //   color: colors[index]
  //   };
  // });

  return (
    <Card className="flex flex-col  w-full  relative  ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={!productsSoldData.length}
            variant="outline"
            size="icon"
            className="absolute right-5 top-5  p-0 h-6 w-6"
          >
            <Ellipsis className=" w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" w-52">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className=" justify-between"
            onClick={() => {
              if (sortDataBy !== "totalCount") setSortDataBy("totalCount");
            }}
          >
            Total units sold
            {sortDataBy === "totalCount" && <Check className=" w-3 h-3" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            className=" justify-between"
            onClick={() => {
              if (sortDataBy !== "totalPriceAfterDiscount")
                setSortDataBy("totalPriceAfterDiscount");
            }}
          >
            Total revenue generated
            {sortDataBy === "totalPriceAfterDiscount" && (
              <Check className=" w-3 h-3" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CardHeader className="items-center pb-0">
        <CardTitle>Products Sold</CardTitle>
        <CardDescription>
          {`${date[0]}`} - {`${date[1]}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {!productsSoldData.length ? (
          <div className="   flex   justify-center my-7 items-center gap-1 ">
            No data <GiTumbleweed className=" w-4 h-4" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ProductSoldTooltip />} />
              <Pie
                onClick={(e) => {
                  if (!isBigScreen) return;
                  const data = e.payload;

                  if (data.id) router.push(`products/${data.id}`);
                }}
                data={productsSoldData}
                dataKey={sortDataBy}
                nameKey="productName"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {finalTotals[sortDataBy].toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {sortDataBy === "totalCount" ? "Units" : "EGP"}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="leading-none text-muted-foreground text-center">
          Showing total products sold {description}
        </div>

        <SoldMoreDetails products={productsPie} date={date} />
      </CardFooter>
    </Card>
  );
}

interface ProductSoldPayload {
  id: number;
  productName?: string;
  productImage: string | null;
  pricePerUnit: number;
  totalCount: number;
  totalDiscount: number;
  fill?: string;
  totalPriceAfterDiscount: number;
  [key: string]: any;
}
interface ChartTooltipContentProps extends TooltipProps<number, string> {
  payload?: { payload: ProductSoldPayload }[];
  label?: string;
}
const ProductSoldTooltip: React.FC<ChartTooltipContentProps> = ({
  payload,
  label,
}) => {
  if (!payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className=" grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {" "}
      <div className=" flex items-start  break-all gap-1">
        <div
          className={cn(
            `shrink-0 rounded-[2px] border-[--color-border]  mt-[3.2px] h-2.5 w-2.5`,
          )}
          style={{ backgroundColor: `${data.fill} ` }}
        />

        <p className="font-medium">{`${data.productName}`}</p>

        {data.productImage && (
          <img
            src={data.productImage}
            alt="Product Image"
            className=" w-6 h-6 rounded-sm  ml-auto object-cover"
          />
        )}
      </div>{" "}
      {data.productName !== "Other" && (
        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Price per unit:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.pricePerUnit)}
          </span>
        </div>
      )}
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center",
        )}
      >
        <span className="text-muted-foreground">Total count:</span>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {data.totalCount} units
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center",
        )}
      >
        <span className="text-muted-foreground">Total Discount:</span>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(data.totalDiscount)}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center",
        )}
      >
        <span className="text-muted-foreground">Net:</span>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(data.totalPriceAfterDiscount)}
        </span>
      </div>
    </div>
  );
};
