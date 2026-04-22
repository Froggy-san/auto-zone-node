import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import downloadAsPdf from "@lib/services/download-pdf";
import CloseButton from "@components/close-button";
import { deleteMultiServicesAction } from "@lib/actions/serviceActions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
const ServiceSelectControls = ({
  isAdmin,
  selected,
  setSelected,
  currentPage,
  pageSize,
  setLoadingIds,
}: {
  isAdmin: boolean;
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  currentPage: number;
  pageSize: number;
  setLoadingIds: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleRemove = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setSelected([]);
      }
    },
    [setSelected],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleRemove);

    return () => {
      document.removeEventListener("keydown", handleRemove);
    };
  }, [handleRemove]);

  return (
    <AnimatePresence>
      {selected.length && (
        <motion.div
          key="selected-controls"
          initial={{ x: 10, opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 10, opacity: 0.5 }}
          transition={{ ease: "easeIn", duration: 0.07 }}
          className=" flex items-center gap-1"
        >
          <p className=" flex text-muted-foreground  text-xs xs:text-sm items-center gap-1 mr-1 xs:mr-3  ">
            <span>SELECTED</span>{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={selected.length}
                initial={{ y: 10, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0.5 }}
                transition={{ ease: "linear", duration: 0.1 }}
              >
                {selected.length}
              </motion.span>
            </AnimatePresence>
          </p>
          <DownloadPdfDia
            selected={selected}
            setSelected={setSelected}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingIds={setLoadingIds}
          />
          {isAdmin && (
            <DeleteDia
              currentPage={currentPage}
              pageSize={pageSize}
              selected={selected}
              setSelected={setSelected}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setLoadingIds={setLoadingIds}
            />
          )}

          <CloseButton
            onClick={() => setSelected([])}
            className=" static  sm:pl-3"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function DeleteDia({
  currentPage,
  pageSize,
  selected,
  setSelected,
  isLoading,
  setIsLoading,
  setLoadingIds,
}: {
  currentPage: number;
  pageSize: number;
  selected: number[];
  isLoading: boolean;
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingIds: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParam = useSearchParams();
  const pathname = usePathname();

  function checkIfLastItem() {
    const params = new URLSearchParams(searchParam);
    if (pageSize === selected.length) {
      if (Number(currentPage) === 1 && pageSize === selected.length) {
        params.delete("dateFrom");
        params.delete("dateTo");
        params.delete("clientId");
        params.delete("carId");
        params.delete("serviceStatusId");
        params.delete("minPrice");
        params.delete("maxPrice");
      }
      if (Number(currentPage) > 1) {
        params.set("page", String(Number(currentPage) - 1));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }
  async function handleDelete() {
    try {
      setIsLoading(true);
      setLoadingIds(selected);
      const { error } = await deleteMultiServicesAction(selected);

      if (error) throw new Error(error);
      setSelected([]);
      setOpen(false);
      checkIfLastItem();
      queryClient.removeQueries({ queryKey: ["servicesStats"] });
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={`Receipt data is ready to be downloaded as a PDF.`}
          />
        ),
      });
    } catch (error: any) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Failed to download.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
      setLoadingIds([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {" "}
        <Button
          variant="destructive"
          className="  mb-1 text-[0.7rem] xs:text-xs gap-1 h-fit px-2.5 py-1"
        >
          {" "}
          <span className=" ">{selected.length}</span> Delete{" "}
          <Trash2 className=" w-3 h-3 xs:w-4 xs:h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>{`Delete ${selected.length} service receipts and all it's related data.`}</DialogDescription>
        </DialogHeader>
        <DialogFooter className=" gap-y-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>

          <Button
            disabled={isLoading}
            variant="destructive"
            type="submit"
            size="sm"
            onClick={handleDelete}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DownloadPdfDia({
  selected,
  setSelected,
  isLoading,
  setIsLoading,
  setLoadingIds,
}: {
  selected: number[];
  isLoading: boolean;
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingIds: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  async function handleDownloadSeparately() {
    try {
      setIsLoading(true);
      setLoadingIds(selected);
      for (const id of selected) {
        await downloadAsPdf([id]);
      }

      setSelected([]);
      setOpen(false);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={`Receipt data is ready to be downloaded as a PDF.`}
          />
        ),
      });
    } catch (error: any) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Failed to download.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
      setLoadingIds([]);
    }
  }

  async function handleDownloadSameFile() {
    try {
      setIsLoading(true);

      await downloadAsPdf(selected, "inSamePage");

      // setSelected([]);
      setOpen(false);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={`Receipt data is ready to be downloaded as a PDF.`}
          />
        ),
      });
    } catch (error: any) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Failed to download.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {" "}
        <Button
          variant="secondary"
          className=" mb-1 text-[0.7rem] xs:text-xs gap-1 h-fit px-2.5 py-1"
        >
          {" "}
          Download as pdf <Download className=" w-3 h-3 xs:w-4 xs:h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download services as pdf</DialogTitle>
          <DialogDescription>{`You are about to Download ${selected.length} service receipts as a PDF. You can choose how you prefer to download multiple receipts, whether you want them all in the same PDF file or in separate files."`}</DialogDescription>
        </DialogHeader>
        <DialogFooter className=" gap-y-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isLoading}
            variant="secondary"
            size="sm"
            onClick={handleDownloadSameFile}
          >
            Download in the same file
          </Button>
          <Button
            disabled={isLoading}
            type="submit"
            size="sm"
            onClick={handleDownloadSeparately}
          >
            Download separately
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceSelectControls;
