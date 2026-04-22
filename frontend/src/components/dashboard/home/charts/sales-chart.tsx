"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
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
import useRevenueCharts from "@lib/queries/useRevenueCharts";
import Spinner from "@components/Spinner";
import ErrorMessage from "@components/error-message";
import { CarItem, CartItem, Order, Service } from "@lib/types";
import {
  eachDayOfInterval,
  formatDate,
  getQuarter,
  isBefore,
  isLeapYear,
  isSameDay,
  isSameYear,
  isThisYear,
  parseISO,
  subDays,
} from "date-fns";
import { cn } from "@lib/utils";
import { formatCurrency } from "@lib/client-helpers";
import FilterBar from "./filter-bar";
import { useMemo, useState } from "react";

import { ServicePie } from "./services-pie";
import { SoldProductsPie } from "./sold-products-pie";
import { GiTumbleweed } from "react-icons/gi";
import WarningTooltip from "./warning-tooltop";
import { DashboardStatsGrid } from "./dashboard-stats";
import { SER_STATUS_DONE_ID } from "@lib/constants";

type selected = "year" | "all" | string;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
  order: { label: "Order", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const SalesCharts = () => {
  const [selected, setSelected] = useState<number | selected>("all");
  const currentYear = new Date().getFullYear();
  const dateFrom = `${currentYear}-1-1`;
  const dateTo = `${currentYear}-12-30`;

  const { data, isLoading, error } = useRevenueCharts(
    selected === "year" ? { dateFrom, dateTo } : {},
  );

  const allServices: Service[] = data?.services || [];
  const allOrders: Order[] = data?.orderStats || [];
  const categories = data?.categories || [];
  const now = new Date();
  const isFirstMonthOfYEar = now.getMonth() === 0;

  let dates: string[] | Date[] = [];

  // Extract unique years
  if (selected === "all")
    dates = Array.from(
      new Set([
        ...allServices.map((item) => item.created_at.split("-")[0]),
        ...allOrders.map((item) => item.created_at.split("-")[0]),
      ]),
    ).sort((a, b) => Number(a) - Number(b));

  if (selected === "year")
    dates = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
  // Array.from(
  //     new Set([
  //       ...allServices.map((item) => item.created_at.split("-")[1]),
  //       ...allOrders.map((item) => item.created_at.split("-")[1]),
  //     ]),
  //   ).sort((a, b) => Number(a) - Number(b));

  if (typeof selected === "number") {
    dates = eachDayOfInterval({
      start: subDays(new Date(), selected - 1),
      end: new Date(),
    });
    // .map((date) => formatDate(date, "MMM dd"))
  }

  const serviceDataByDate =
    typeof selected !== "number"
      ? allServices
      : dates.flatMap((date) =>
          allServices.filter((items) => {
            // Get all the services made in each year.
            // if (selected === "all" && typeof date === "string")
            //   return items.created_at.startsWith(date);
            // if (selected === "year")
            //   return items.created_at.split("-")[1] === date;
            return isSameDay(items.created_at, date);
          }),
        );

  const ordersDataByDate =
    typeof selected !== "number"
      ? allOrders
      : dates.flatMap((date) =>
          allOrders.filter((items) => {
            return isSameDay(items.created_at, date);
          }),
        );

  // 2. Get products pie data.

  const productPieData = useMemo(() => {
    const services = serviceDataByDate.filter(
      (serv) => serv.serviceStatuses.id === SER_STATUS_DONE_ID,
    );
    const orders = ordersDataByDate.filter(
      (order) => order.payment_status === "paid",
    );

    const productsSoldInOrders = orders
      .flatMap((order) => order.items?.items)
      .filter((p) => p !== undefined) as CartItem[];

    const products = services
      .flatMap((s) => s.productsToSell)
      .filter((pro) => !pro.isReturned); // Make sure that we get the products that aren't returned.

    const productIds = Array.from(
      new Set([
        ...products.map((p) => p.productId),
        ...productsSoldInOrders.map((p) => p.id),
      ]),
    );

    const productsPieData = productIds.map((id) => {
      const productInService = products
        .filter((p) => p.productId === id)
        .reduce(
          (acc, currPro) => {
            const image = currPro.product.productImages.length
              ? currPro.product.productImages[0].imageUrl
              : "";
            acc.pricePerUnit = currPro.pricePerUnit;
            acc.productName = currPro.product.name;
            acc.productImage = image;
            acc.totalCount += currPro.count;
            acc.totalDiscount += currPro.count * currPro.discount;
            acc.totalPriceAfterDiscount += currPro.totalPriceAfterDiscount;
            return acc;
          },
          {
            id: id,
            productName: "",
            productImage: "",
            pricePerUnit: 0,
            totalCount: 0,
            totalDiscount: 0,

            totalPriceAfterDiscount: 0,
          },
        );

      const productInOrder = productsSoldInOrders
        .filter((p) => p.id === id)
        .reduce(
          (acc, currProInOrder) => {
            const hasSalePrice = currProInOrder.salePrice > 0;
            acc.productImage = currProInOrder.productImages.length
              ? currProInOrder.productImages[0].imageUrl
              : "";
            acc.pricePerUnit = currProInOrder.listPrice;
            acc.productName = currProInOrder.name;
            acc.totalCount += currProInOrder.quantity;
            acc.totalDiscount +=
              (currProInOrder.listPrice - currProInOrder.salePrice) *
              currProInOrder.quantity;
            acc.totalPriceAfterDiscount += hasSalePrice
              ? currProInOrder.salePrice * currProInOrder.quantity
              : currProInOrder.listPrice * currProInOrder.quantity;

            return acc;
          },
          {
            id: id,
            productName: "",
            productImage: "",
            pricePerUnit: 0,
            totalCount: 0,
            totalDiscount: 0,

            totalPriceAfterDiscount: 0,
          },
        );

      return {
        id,
        productName: productInService.productName,
        productImage:
          productInService.productImage || productInOrder.productImage,
        pricePerUnit: productInService.pricePerUnit,
        totalCount: productInService.totalCount + productInOrder.totalCount,
        totalDiscount:
          productInService.totalDiscount + productInOrder.totalDiscount,

        totalPriceAfterDiscount:
          productInService.totalPriceAfterDiscount +
          productInOrder.totalPriceAfterDiscount,
      };
    });

    return productsPieData;
  }, [serviceDataByDate, ordersDataByDate]);

  // Get the service fees data.

  const serviceFeeData = useMemo(() => {
    const services = serviceDataByDate.filter(
      (serv) => serv.serviceStatuses.id === SER_STATUS_DONE_ID,
    );

    const serviceFees = services
      .flatMap((serv) => serv.servicesFee)
      .filter((s) => !s.isReturned); // Make sure you get all non-returned service fees.

    // Group the Services by their category id.

    const categoryIds = Array.from(
      new Set(serviceFees.map((serv) => serv.categoryId)),
    );

    const serviceFeePie = categoryIds.map((id) =>
      serviceFees
        .filter((fee) => fee.categoryId === id)
        .reduce(
          (acc, currFee, idx, arr) => {
            acc.totalCount = arr.length;
            acc.totalDiscount += currFee.discount;
            acc.totalPrice += currFee.price;
            acc.totalPriceAfterDiscount += currFee.totalPriceAfterDiscount;
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
          },
        ),
    );
    return serviceFeePie;
  }, [allServices, selected, dates]);

  // Get the charts data.

  const allSalesData = useMemo(() => {
    return dates.map((date, i) => {
      //1. Get all the services performed in each date.
      const servicesForDate = allServices.filter((service, serIdx) => {
        let filterType = isSameDay(service.created_at, date);
        // Get all the services made in each year.
        if (selected === "all" && typeof date === "string")
          filterType = service.created_at.startsWith(date);
        // Gell all service made for each month in the current year.
        if (selected === "year")
          filterType = service.created_at.split("-")[1] === date;
        return filterType && service.serviceStatuses.id === SER_STATUS_DONE_ID;
      });

      //2. Calculate the data.

      const totalServicesForDate = servicesForDate.reduce(
        (acc, currItem) => {
          // Get the totals of sold products for each date.
          // Some of the Products can be marked as returned so we filter all the unreturned products in order to have an accurate representation of the total products sold in a given date.
          const productSold = currItem.productsToSell.filter(
            (pro) => !pro.isReturned,
          );
          const soldProductsData = productSold.reduce(
            (soldAcc, currSold) => {
              soldAcc.totalPrice += currSold.pricePerUnit * currSold.count;
              soldAcc.totalDiscounts += currSold.discount * currSold.count;
              soldAcc.totalPriceAfterDiscount +=
                currSold.totalPriceAfterDiscount;
              soldAcc.unitsSold += currSold.count;

              return soldAcc;
            },
            {
              totalPrice: 0,
              totalDiscounts: 0,
              totalPriceAfterDiscount: 0,
              unitsSold: 0,
            },
          );

          // Get the totals of the service fees performed for each date.

          // Some of the fees can be marked as returned so we filter all the unreturned fees in order to have an accurate representation of the total fees performed in a given date.
          const serviceFees = currItem.servicesFee.filter(
            (serv) => !serv.isReturned,
          );
          const servicesProvided = serviceFees.reduce(
            (serAcc, currService) => {
              serAcc.totalPrice += currService.price;
              serAcc.totalDiscount += currService.discount;
              serAcc.totalPriceAfterDiscount +=
                currService.totalPriceAfterDiscount;
              return serAcc;
            },
            {
              totalPrice: 0,
              totalDiscount: 0,
              totalPriceAfterDiscount: 0,
              totalFees: serviceFees.length,
            },
          );

          acc.totalProSoldPriceBeforeDisInServ += soldProductsData.totalPrice; // Total Product Sold Before Discount

          acc.totalFeesPriceBeforeDis += servicesProvided.totalPrice; // Total Service Price Before Discount

          acc.totalFeesDis += servicesProvided.totalDiscount; // Total Service Fees Discount

          acc.totalProSoldDisInServ += soldProductsData.totalDiscounts; // Total Product Sold Discount

          // acc.totalServicesDiscount +=
          //   soldProductsData.totalDiscounts + servicesProvided.totalDiscount;

          acc.totalUnitsSoldInServ += soldProductsData.unitsSold; // Total Units sold In All the services

          acc.totalFeesIssued += servicesProvided.totalFees; // Total Service Fees Issued

          acc.totalProSoldPriceAfterDisInServ +=
            soldProductsData.totalPriceAfterDiscount; // Total Products Sold After Discount

          acc.totalFeesAfterDis += servicesProvided.totalPriceAfterDiscount;

          acc.netServices +=
            soldProductsData.totalPriceAfterDiscount +
            servicesProvided.totalPriceAfterDiscount; // Total Services After Discount
          return acc;
        },
        {
          totalServices: servicesForDate.length, // Count Of Services Performed
          totalUnitsSoldInServ: 0, // Count Of Units Sold in each Service Performed
          totalFeesIssued: 0, // Count Of Fees Issued In Each Serivce Performed
          totalProSoldPriceBeforeDisInServ: 0, // Total Products Sold Before Discount
          totalProSoldPriceAfterDisInServ: 0, // Total Products Sold After Discount
          totalProSoldDisInServ: 0, // Total Discount Given For Products Sold
          totalFeesDis: 0, // Total Discount Given For Service Fee
          totalFeesPriceBeforeDis: 0, // Total Fees Price Before Discount
          totalFeesAfterDis: 0, // Total Fees Price After Discount
          netServices: 0,
        },
      );

      //2. Calculate orders data.

      const ordersForDate = allOrders.filter((order) => {
        let filterType = isSameDay(order.created_at, date);
        // Get all the orders made in each year.
        if (selected === "all" && typeof date === "string")
          filterType = order.created_at.startsWith(date);
        if (selected === "year")
          filterType = order.created_at.split("-")[1] === date;
        return filterType && order.payment_status === "paid";
      });

      const ordersForDateData = ordersForDate.reduce(
        (acc, currOrder) => {
          const productsSold: CartItem[] = currOrder.items?.items || [];

          const productSoldData = productsSold.reduce(
            (acc, currPro) => {
              acc.totalPrice += currPro.listPrice;
              acc.totalDiscount += currPro.listPrice - currPro.salePrice;
              return acc;
            },
            {
              totalPrice: 0,
              totalDiscount: 0,
              totalUnitsSold: productsSold.length,
            },
          );

          acc.totalOrdersDiscount += productSoldData.totalDiscount; // Total Discount Given For Each Order

          acc.totalOrdersPriceBeforeDis += productSoldData.totalPrice; // Total Orders Price Before Discount

          acc.totalOrdersPriceAfterDis += currOrder.total_amount; // Total Orders Price After Discount

          acc.totalOrdersUnitsSold += productSoldData.totalUnitsSold; // Total Units Sold In Each Order

          return acc;
        },
        {
          totalOrdersEntries: ordersForDate.length,
          totalOrdersUnitsSold: 0,
          totalOrdersPriceBeforeDis: 0,
          totalOrdersDiscount: 0,
          totalOrdersPriceAfterDis: 0,
        },
      );

      const totalDiscount =
        totalServicesForDate.totalFeesDis +
        totalServicesForDate.totalProSoldDisInServ +
        ordersForDateData.totalOrdersDiscount;

      //  Format the date for the chart
      const formattedDate =
        selected === "year"
          ? months[i]
          : typeof selected === "number"
            ? formatDate(date, "MMM dd")
            : dates[i];

      return {
        date: formattedDate,
        totalDiscount,
        ...totalServicesForDate,
        ...ordersForDateData,
      };
    });
  }, [dates, selected, allOrders, allServices]);

  // Stats data

  const stats = useMemo(() => {
    const data = allSalesData.reduce(
      (acc, currData) => {
        acc.totalRevenue +=
          currData.netServices + currData.totalOrdersPriceAfterDis;
        acc.ordersRevenue += currData.totalOrdersPriceAfterDis;
        acc.servicesRevenue += currData.netServices;
        acc.ordersCount += currData.totalOrdersEntries;
        acc.servicesCount += currData.totalServices;
        acc.paidAmount +=
          currData.netServices + currData.totalOrdersPriceAfterDis;

        return acc;
      },
      {
        totalRevenue: 0,
        ordersRevenue: 0,
        servicesRevenue: 0,
        ordersCount: 0,
        servicesCount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        refundedAmount: 0,
      },
    );

    const unpaidAndRefundedOrders = ordersDataByDate
      .filter(
        (o) => o.payment_status === "refunded" || o.payment_status === "unpaid",
      )
      .reduce(
        (acc, currOrder) => {
          const isUnPaid = currOrder.payment_status === "unpaid";
          acc.unpaidAmount += isUnPaid ? currOrder.total_amount : 0;
          acc.orderRefundedAmount += !isUnPaid ? currOrder.total_amount : 0;
          return acc;
        },
        { unpaidAmount: 0, orderRefundedAmount: 0 },
      );

    // Get all the returned products and service fees.
    const services = dates.flatMap((date) => {
      //1. Get all the services performed in each date.
      return allServices.filter((service, serIdx) => {
        let filterType = isSameDay(service.created_at, date);
        // Get all the services made in each year.
        if (selected === "all" && typeof date === "string")
          filterType = service.created_at.startsWith(date);
        // Gell all service made for each month in the current year.
        if (selected === "year")
          filterType = service.created_at.split("-")[1] === date;
        return filterType && service.serviceStatuses.id === SER_STATUS_DONE_ID;
      });
    });

    /// Calculate al the reunted prices.
    const returnedServices = services.reduce(
      (acc, currItem) => {
        /// Get the total retunred products for each service
        const productSold = currItem.productsToSell.filter(
          (pro) => pro.isReturned,
        );
        const soldProductsData = productSold.reduce(
          (soldAcc, currSold) => {
            soldAcc.totalPriceAfterDiscount += currSold.totalPriceAfterDiscount;

            return soldAcc;
          },
          {
            totalPriceAfterDiscount: 0,
          },
        );

        const serviceFees = currItem.servicesFee.filter(
          (serv) => serv.isReturned,
        );
        const servicesProvided = serviceFees.reduce(
          (serAcc, currService) => {
            serAcc.totalPriceAfterDiscount +=
              currService.totalPriceAfterDiscount;
            return serAcc;
          },
          {
            totalPriceAfterDiscount: 0,
          },
        );

        acc.netReturnedPrice +=
          soldProductsData.totalPriceAfterDiscount +
          servicesProvided.totalPriceAfterDiscount; // Total Services After Discount
        return acc;
      },
      {
        netReturnedPrice: 0,
      },
    );

    data.unpaidAmount = unpaidAndRefundedOrders.unpaidAmount;
    data.refundedAmount =
      unpaidAndRefundedOrders.orderRefundedAmount +
      returnedServices.netReturnedPrice;

    return data;
  }, [allSalesData, ordersDataByDate, dates, allServices]);

  // const salesData = useMemo(() => {
  //   return serviceDataByDate.map((item, index) =>
  //     item.reduce(
  //       (acc, currItem) => {
  //         // Get the totals of sold products for each date.
  //         const soldProductsData = currItem.productsToSell.reduce(
  //           (soldAcc, currSold) => {
  //             soldAcc.totalPrice += currSold.pricePerUnit * currSold.count;
  //             soldAcc.totalDiscounts += currSold.discount * currSold.count;
  //             soldAcc.totalPriceAfterDiscount +=
  //               currSold.totalPriceAfterDiscount;
  //             return soldAcc;
  //           },
  //           { totalPrice: 0, totalDiscounts: 0, totalPriceAfterDiscount: 0 },
  //         );

  //         // Get the totals of the services for each date.
  //         const servicesProvided = currItem.servicesFee.reduce(
  //           (serAcc, currService) => {
  //             serAcc.totalPrice += currService.price;
  //             serAcc.totalDiscount += currService.discount;
  //             serAcc.totalPriceAfterDiscount +=
  //               currService.totalPriceAfterDiscount;
  //             return serAcc;
  //           },
  //           { totalPrice: 0, totalDiscount: 0, totalPriceAfterDiscount: 0 },
  //         );

  //         acc.totalProductSold += soldProductsData.totalPrice;
  //         acc.totalServices += servicesProvided.totalPrice;
  //         acc.totalDiscount +=
  //           soldProductsData.totalDiscounts + servicesProvided.totalDiscount;
  //         acc.totalPriceAfterDiscount +=
  //           soldProductsData.totalPriceAfterDiscount +
  //           servicesProvided.totalPriceAfterDiscount;
  //         return acc;
  //       },
  //       {
  //         date:
  //           selected === "year"
  //             ? months[Number(dates[index]) - 1]
  //             : typeof selected === "number"
  //               ? formatDate(dates[index], "MMM dd")
  //               : dates[index],
  //         totalProductSold: 0,
  //         totalServices: 0,
  //         totalDiscount: 0,
  //         totalPriceAfterDiscount: 0,
  //       },
  //     ),
  //   );
  // }, [selected, serviceDataByDate]);
  // .filter((item) => item.totalPriceAfterDiscount > 0);

  //

  const {
    latestGrowth,
    trend: newTrend,
    growthDates,
  } = useMemo(() => {
    if (allSalesData.length < 2)
      return { latestGrowth: 0, trend: "Stable", growthDates: {} };

    const now = new Date();
    let currPeriodData = null;
    let prevPeriodData = null;

    switch (selected) {
      case "all": {
        const lastItem = allSalesData[allSalesData.length - 1];
        const currentYearStr = now.getFullYear().toString();

        // Check if the last data point is the current year
        if (lastItem.date === currentYearStr) {
          // Only compare the current year if we are in Q4 (Oct, Nov, Dec)
          // Otherwise, it's safer to compare the last two FULL years (e.g., 2025 vs 2024)
          if (getQuarter(now) === 4) {
            currPeriodData = allSalesData[allSalesData.length - 1];
            prevPeriodData = allSalesData[allSalesData.length - 2];
          } else {
            currPeriodData = allSalesData[allSalesData.length - 2];
            prevPeriodData = allSalesData[allSalesData.length - 3];
          }
        } else {
          currPeriodData = allSalesData[allSalesData.length - 1];
          prevPeriodData = allSalesData[allSalesData.length - 2];
        }
        break;
      }

      case "year": {
        const currMonthIdx = now.getMonth(); // Feb is 1
        // If the current month of the year is the first month then compare it to it self.
        if (currMonthIdx === 0) {
          const hasRev =
            allSalesData[0].netServices +
              allSalesData[0].totalOrdersPriceAfterDis >
            0;
          return {
            latestGrowth: hasRev ? 100 : 0,
            trend: hasRev ? "Upward" : "Stable",
            growthDates: {
              currDate: allSalesData[0].date,
              prevDate: allSalesData[0].date,
            },
          };
        }

        // We compare the last COMPLETED month to the one before it
        // Example: If today is Feb, compare Jan (index 0) to Dec (from previous data - requires caution)
        // OR: Compare Feb (index 1) to Jan (index 0)
        currPeriodData = allSalesData[currMonthIdx];
        prevPeriodData = allSalesData[currMonthIdx - 1];
        break;
      }

      default: {
        currPeriodData = allSalesData[allSalesData.length - 1];
        prevPeriodData = allSalesData[allSalesData.length - 2];
      }
    }

    // Safety check if indices went out of bounds
    if (!currPeriodData || !prevPeriodData)
      return { latestGrowth: 0, trend: "Stable", growthDates: {} };

    const currRev =
      currPeriodData.netServices + currPeriodData.totalOrdersPriceAfterDis;
    const prevRev =
      prevPeriodData.netServices + prevPeriodData.totalOrdersPriceAfterDis;

    let latestGrowth = 0;
    if (prevRev === 0) {
      latestGrowth = currRev > 0 ? 100 : 0;
    } else {
      latestGrowth = ((currRev - prevRev) / prevRev) * 100;
    }

    return {
      latestGrowth: Number(latestGrowth.toFixed(1)), // Keep it clean for UI
      trend: latestGrowth >= 0 ? "Upward" : "Downward",
      growthDates: {
        prevDate: prevPeriodData.date,
        currDate: currPeriodData.date,
      },
    };
  }, [allSalesData, selected]);

  // const { growthRates, averageGrowthRate, trend } = useMemo(() => {
  //   // 1. DO NOT filter out zeros. Use the full allSalesData timeline.
  //   const revenueData = allSalesData;

  //   if (revenueData.length < 2) {
  //     return {
  //       growthRates: [],
  //       averageGrowthRate: 0,
  //       trend: "Not enough data",
  //     };
  //   }

  //   const growthRates = [];

  //   for (let i = 1; i < revenueData.length; i++) {
  //     const prev =
  //       revenueData[i - 1].netServices +
  //       revenueData[i - 1].totalOrdersPriceAfterDis;
  //     const curr =
  //       revenueData[i].netServices + revenueData[i].totalOrdersPriceAfterDis;

  //     let growthRate = 0;

  //     if (prev === 0 && curr === 0) {
  //       growthRate = 0; // No change
  //     } else if (prev === 0 && curr > 0) {
  //       growthRate = 100; // Technical "start" of growth (or skip this period)
  //     } else {
  //       growthRate = ((curr - prev) / prev) * 100;
  //     }

  //     growthRates.push(growthRate);
  //   }

  //   const averageGrowthRate =
  //     growthRates.length > 0
  //       ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
  //       : 0;

  //   return {
  //     growthRates,
  //     averageGrowthRate,
  //     trend:
  //       averageGrowthRate > 0
  //         ? "Upward"
  //         : averageGrowthRate < 0
  //           ? "Downward"
  //           : "Stable",
  //   };
  // }, [allSalesData]);

  // const { growthRates, averageGrowthRate, trend } = useMemo(() => {
  //   const revenueData = allSalesData.filter(
  //     (item) => item.netServices + item.totalOrdersPriceAfterDis > 0,
  //   );
  //   if (revenueData.length < 2) {
  //     return {
  //       growthRates: [],
  //       averageGrowthRate: 0,
  //       trend: "Not enough data",
  //     };
  //   }
  //   const growthRates = [];
  //   for (let i = 1; i < revenueData.length; i++) {
  //     const previousPeriod = revenueData[i - 1];
  //     const currPeriod = revenueData[i];
  //     const previousRevenue =
  //       previousPeriod.netServices + previousPeriod.totalOrdersPriceAfterDis;
  //     const currentRevenue =
  //       currPeriod.netServices + currPeriod.totalOrdersPriceAfterDis;
  //     const growthRate =
  //       ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  //     growthRates.push(growthRate);
  //   }
  //   const averageGrowthRate =
  //     growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

  //   return {
  //     growthRates,
  //     averageGrowthRate,
  //     trend: averageGrowthRate > 0 ? "Upward" : "Downward",
  //   };
  // }, [allSalesData]);

  const description = useMemo(() => {
    switch (selected) {
      case "all":
        return " for each year.";
      case "year":
        return ` for the year '${currentYear}'.`;
      case 90:
        return ` for last 90 days.`;
      case 30:
        return ` for last 30 days.`;
      case 7:
        return ` for last 7 days.`;
      default:
        return ".";
    }
  }, [selected]);

  const date = [allSalesData.at(0)?.date, allSalesData.at(-1)?.date];

  if (isLoading) return <Spinner />;
  if (error instanceof Error)
    return <ErrorMessage>{error.message}</ErrorMessage>;

  return (
    <div className=" space-y-7 sm:mx-5">
      <FilterBar selected={selected} setSelected={setSelected} />

      <DashboardStatsGrid
        totalRevenue={stats.totalRevenue}
        ordersRevenue={stats.ordersRevenue}
        servicesRevenue={stats.servicesRevenue}
        ordersCount={stats.ordersCount}
        servicesCount={stats.servicesCount}
        paidAmount={stats.paidAmount}
        unpaidAmount={stats.unpaidAmount}
        refundedAmount={stats.refundedAmount}
      />
      <Card className="  relative">
        <WarningTooltip />
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Showing total revenue {description}</CardDescription>
        </CardHeader>
        <CardContent className=" p-1 pt-0 sm:p-6">
          <ChartContainer config={chartConfig} className=" h-[50vh] w-full  ">
            <AreaChart
              accessibilityLayer
              data={allSalesData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  return value;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContentCustom />}
              />
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillOrder" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-order)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-order)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <Area
                dataKey="totalDiscount"
                type="monotone"
                fill="url(#fillMobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                // stackId="a"
              />

              <Area
                dataKey="netServices"
                type="monotone"
                fill="url(#fillDesktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                // stackId="a"
              />
              <Area
                dataKey="totalOrdersPriceAfterDis"
                type="monotone"
                fill="url(#fillOrder)"
                fillOpacity={0.4}
                stroke="var(--color-order)"
                // stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-medium leading-none">
                  {latestGrowth === 0 && newTrend === "Stable" ? (
                    "No change in revenue"
                  ) : (
                    <>
                      {newTrend === "Upward" ? "Increased" : "Decreased"} by{" "}
                      {Math.abs(latestGrowth)}%{" "}
                      {newTrend === "Upward" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                      )}
                    </>
                  )}
                </div>

                {/* Add the specific comparison dates below */}
                {growthDates && growthDates?.prevDate && (
                  <div className="text-xs text-muted-foreground leading-none">
                    Comparing {growthDates.currDate.toString()} to{" "}
                    {growthDates.prevDate.toString()}
                  </div>
                )}
              </div>
              {/* <div className="flex items-center gap-2 font-medium leading-none">
                {!averageGrowthRate ? (
                  `${trend}`
                ) : (
                  <>
                    {" "}
                    Trending {trend} by {averageGrowthRate.toFixed(1)}%{" "}
                    <TrendingUp className="h-4 w-4" />
                  </>
                )}
              </div> */}
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {!dates.length ? null : `${date[0]} - ${date[1]}`}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className=" flex flex-col   items-center  1xs:flex-row gap-3 lg:gap-10">
        <SoldProductsPie
          date={date}
          description={description}
          productsPieData={productPieData}
        />
        <ServicePie
          date={date}
          categories={categories}
          description={description}
          serviceFeesData={serviceFeeData}
        />
      </div>
    </div>
  );
};

export default SalesCharts;

interface CustomPayload {
  totalOrdersEntries: number;
  totalOrdersUnitsSold: number;
  totalOrdersPriceBeforeDis: number;
  totalOrdersDiscount: number;
  totalOrdersPriceAfterDis: number;
  totalServices: number;
  totalUnitsSoldInServ: number;
  totalFeesIssued: number;
  totalProSoldPriceBeforeDisInServ: number;
  totalProSoldPriceAfterDisInServ: number;
  totalProSoldDisInServ: number;
  totalFeesDis: number;
  totalFeesPriceBeforeDis: number;
  totalFeesAfterDis: number;
  netServices: number;
  totalDiscount: number;
  date: string | Date;
  // [key: string]: any;
}
interface ChartTooltipContentProps extends TooltipProps<number, string> {
  payload?: { payload: CustomPayload }[];
  label?: string;
}
const ChartTooltipContentCustom: React.FC<ChartTooltipContentProps> = ({
  payload,
  label,
}) => {
  if (!payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className=" grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {" "}
      <p className="font-medium">{
        // `${
        //   selected === "year" ? months[Number(label) - 1] : label
        // }`
        `${label}`
      }</p>{" "}
      {/* Services Overview */}
      <section className=" flex flex-col gap-1.5 mb-1">
        <h2 className=" font-semibold text-chart-1 text-xs mb-0.5 flex items-center justify-between gap-2">
          <span>Service</span> <span>{data.totalServices}</span>
        </h2>
        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Total Products Sold:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalProSoldPriceBeforeDisInServ)}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-2 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">
              Total Products Dicount:
            </span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalProSoldDisInServ)}
          </span>
        </div>
        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Total Units Sold:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {data.totalUnitsSoldInServ.toLocaleString()}{" "}
            <span className=" text-muted-foreground text-xs">units</span>
          </span>
        </div>

        {/*  End of products sold data */}
        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Total Service Fees:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalFeesPriceBeforeDis)}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-2 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">
              Total Service Fees Dicount:
            </span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalFeesDis)}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Total Fees Issued:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {data.totalFeesIssued.toLocaleString()}{" "}
            <span className=" text-muted-foreground text-xs">Issued</span>
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-2 justify-between leading-none items-center mt-1",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">
              Total Services discount:
            </span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalFeesDis + data.totalProSoldDisInServ)}
          </span>
        </div>
        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className=" flex items-center gap-1">
            <div
              className={cn(
                "shrink-0 rounded-[2px] border-[--color-border]  bg-chart-1 h-2.5 w-2.5",
              )}
            />
            <span className="text-muted-foreground">Net Services:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(
              data.totalProSoldPriceAfterDisInServ + data.totalFeesAfterDis,
            )}
          </span>
        </div>
      </section>
      {/* End of Serivces section */}
      <div className=" h-[1px] w-[97%] mx-auto bg-chart-1" />
      {/* Start Orders Overview */}
      <section className=" flex flex-col gap-1.5 mb-1">
        <h2 className=" font-semibold text-chart-3 text-xs mb-0.5 flex items-center justify-between gap-2">
          <span>Orders</span> <span>{data.totalOrdersEntries}</span>
        </h2>
        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Total Products Sold:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalOrdersPriceBeforeDis)}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-2 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">
              Total Products Dicount:
            </span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalOrdersDiscount)}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Total Units Sold:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {data.totalOrdersUnitsSold.toLocaleString()}{" "}
            <span className=" text-muted-foreground text-xs">units</span>
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 gap-1 justify-between leading-none items-center",
          )}
        >
          <div className=" flex items-center gap-1">
            <div
              className={cn(
                "shrink-0 rounded-[2px] border-[--color-border]  bg-chart-3 h-2.5 w-2.5",
              )}
            />
            <span className="text-muted-foreground">Net Orders:</span>
          </div>

          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(data.totalOrdersPriceAfterDis)}
          </span>
        </div>
      </section>
      {/* End of Orders Overview */}
      <div className=" h-[1px] w-[97%] mx-auto bg-chart-3" />
      {/* Footer  */}
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center",
        )}
      >
        <div className=" flex items-center gap-1">
          <div
            className={cn(
              "shrink-0 rounded-[2px] border-[--color-border] bg-chart-2 h-2.5 w-2.5",
            )}
          />
          <span className="text-muted-foreground">Total Discount:</span>
        </div>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(data.totalDiscount)}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 gap-1 justify-between leading-none items-center",
        )}
      >
        <div className=" flex items-center gap-1">
          <span className="text-muted-foreground">Net:</span>
        </div>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(data.netServices + data.totalOrdersPriceAfterDis)}
        </span>
      </div>
    </div>
  );
};
