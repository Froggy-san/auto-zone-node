// import { getCarsCountAction } from "@lib/actions/carsAction";
// import { useQuery } from "@tanstack/react-query";

// interface GragePaginationProps {
//   color: string;
//   plateNumber: string;
//   chassisNumber: string;
//   motorNumber: string;
//   clientId: string;
//   carInfoId: string;
// }
// export default function useGragePagination(
//   paginationProps: GragePaginationProps
// ) {
//   const { data: { data: count, error } = {}, isLoading } = useQuery({
//     queryFn: async () => await getCarsCountAction(paginationProps),
//     queryKey: ["carCount", paginationProps],
//   });

//   return { count, error, isLoading };
// }
