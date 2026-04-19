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
import { Check, Ellipsis } from "lucide-react";
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
} from "@/components/ui/chart";
import { Category, Service } from "@lib/types";
import { formatCurrency } from "@lib/client-helpers";
import { cn } from "@lib/utils";

import { Button } from "@components/ui/button";
import { GiTumbleweed } from "react-icons/gi";
import FeesMoreDetails from "./fees-more-details";

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

interface Props {
  salesData: Service[][];
  date: (string | Date | undefined)[];
  description: string;
  categories: Category[];
}
export function ServicePie({
  salesData,
  date,
  description,
  categories,
}: Props) {
  const [sortDataBy, setSortDataBy] = React.useState<
    "totalPriceAfterDiscount" | "totalCount"
  >("totalCount");
  const flatData = salesData.flat();
  const services = flatData.map((item) => item.servicesFee).flat();
  const productIds = Array.from(
    new Set(services.map((serv) => serv.categoryId))
  );

  const servicePie = React.useMemo(() => {
    return productIds
      .map((id, index) => {
        // const ser = services.find((item) => item.categoryId === id);
        return services
          .filter((serv) => serv.categoryId === id)
          .reduce(
            (acc, currItem, index, arr) => {
              acc.totalCount = arr.length;
              acc.totalDiscount += currItem.discount;
              acc.totalPrice += currItem.price;
              acc.totalPriceAfterDiscount += currItem.totalPriceAfterDiscount;
              return acc;
            },
            {
              id: id,
              name: categories.find((cat) => cat.id === id)?.name || id,
              totalPrice: 0,
              totalCount: 0,
              totalDiscount: 0,
              // fill: colors[index],
              totalPriceAfterDiscount: 0,
            }
          );
      })
      .sort((a, b) => b[sortDataBy] - a[sortDataBy])
      .map((fee, index) => {
        return { ...fee, fill: colors[index] || "hsl(0deg 0% 50.2%)" };
      });
  }, [flatData]);

  const servicesMoreThanSix = React.useMemo(() => {
    if (servicePie.length > 6) {
      const firstSix = servicePie.slice(0, 6).map((item, index) => {
        return { ...item, fill: colors[index] };
      });
      const fromSix = servicePie.slice(6);

      const theTotalsFromSix = fromSix.reduce(
        (acc, currItem) => {
          acc.totalCount += currItem.totalCount;
          acc.totalPrice += currItem.totalPrice;
          acc.totalDiscount += currItem.totalDiscount;
          acc.totalPriceAfterDiscount += currItem.totalPriceAfterDiscount;

          return acc;
        },
        {
          name: "Other",
          totalPrice: 0,
          totalCount: 0,
          totalDiscount: 0,
          totalPriceAfterDiscount: 0,
        }
      );
      return [...firstSix, theTotalsFromSix];
    } else return [];
  }, [servicePie]);

  const servicesPreformed = servicesMoreThanSix.length
    ? servicesMoreThanSix
    : servicePie;

  const finalTotals = React.useMemo(() => {
    return servicesPreformed.reduce(
      (acc, curr) => {
        acc.totalPriceAfterDiscount += curr.totalPriceAfterDiscount;
        acc.totalCount += curr.totalCount;

        return acc;
      },
      { totalCount: 0, totalPriceAfterDiscount: 0 }
    );
  }, [servicesPreformed]);

  return (
    <Card className="flex flex-col  relative  w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={!servicesPreformed.length}
            variant="outline"
            size="icon"
            className="      absolute right-5 top-5  p-0 h-6 w-6"
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
            Total services preformed
            {sortDataBy === "totalCount" && <Check className=" w-3 h-3" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            className=" justify-between"
            onClick={() => {
              if (sortDataBy !== "totalPriceAfterDiscount")
                setSortDataBy("totalPriceAfterDiscount");
            }}
          >
            Total fees revenue generated
            {sortDataBy === "totalPriceAfterDiscount" && (
              <Check className=" w-3 h-3" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CardHeader className="items-center pb-0">
        <CardTitle>Services Preformed</CardTitle>
        <CardDescription>
          {`${date[0]}`} - {`${date[1]}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {!servicesPreformed.length ? (
          <div className="   flex   justify-center my-7 items-center gap-1 ">
            No data <GiTumbleweed className=" w-4 h-4" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ServicesTooltip />} />
              <Pie
                data={servicesPreformed}
                dataKey={sortDataBy}
                nameKey="name"
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
                            {sortDataBy === "totalCount" ? "Services" : "EGP"}
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
          Showing total services preformed {description}
        </div>
        <FeesMoreDetails fees={servicePie} date={date} />
      </CardFooter>
    </Card>
  );
}

interface ServicesPayload {
  id: number;
  name?: string;
  totalPrice: number;
  totalCount: number;
  totalDiscount: number;
  fill?: string;
  totalPriceAfterDiscount: number;
  [key: string]: any;
}
interface ChartTooltipContentProps extends TooltipProps<number, string> {
  payload?: { payload: ServicesPayload }[];
  label?: string;
}
const ServicesTooltip: React.FC<ChartTooltipContentProps> = ({
  payload,
  label,
}) => {
  if (!payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className=" grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {" "}
      <div className=" flex items-center gap-1">
        <div
          className={cn(
            `shrink-0 rounded-[2px] border-[--color-border]  h-2.5 w-2.5`
          )}
          style={{ backgroundColor: `${data.fill} ` }}
        />

        <p className="font-medium">{`${data.name}`}</p>
      </div>{" "}
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center"
        )}
      >
        <span className="text-muted-foreground">Total count:</span>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {data.totalCount} units
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center"
        )}
      >
        <div className="grid gap-1.5">
          <span className="text-muted-foreground">Total price:</span>
        </div>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(data.totalPrice)}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center"
        )}
      >
        <span className="text-muted-foreground">Total Discount:</span>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(data.totalDiscount)}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center"
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
