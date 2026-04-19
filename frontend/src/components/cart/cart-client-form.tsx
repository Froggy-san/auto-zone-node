"use client";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import React, {
  forwardRef,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { getPhoneData, PhoneInput } from "@components/phomeInput/PhoneInput";
import { FaCcPaypal, FaCcMastercard } from "react-icons/fa";
import { CiDeliveryTruck } from "react-icons/ci";

import { Button } from "@components/ui/button";
import { useRouter } from "next/navigation";
import { Calendar } from "@components/ui/calendar";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@lib/store/store";
import { getCart, getClient, setClient, setDate } from "./cartSlice";
import { Cross2Icon } from "@radix-ui/react-icons";
import FormErrorMessage from "@components/form-error-message";

type Inputs = {
  name: string;
  email: string;
  phone: string;
};

const CartClientForm = () => {
  const cart = useSelector(getCart);
  const date = useSelector(({ cartData }: RootState) => cartData.date);
  const client = useSelector(getClient);
  const dispatch = useDispatch();

  const currentDate = new Date();
  // const [date, setDate] = React.useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = React.useState(date ? true : false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const submitForm = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const diffInDates = date
    ? formatDistanceToNow(date, {
        addSuffix: true,
      })
    : undefined;
  // Calculate how many days left to the chosen date
  const diffInDays = date ? differenceInDays(date, currentDate) : 0;
  // To know if the date seleceted exceeds the 31days.
  const periodExceeds = 31 - diffInDays < 0;

  const {
    register,
    handleSubmit,
    getValues,
    watch,

    formState: {
      errors,
      isSubmitting,
      isSubmitSuccessful,
      isValid: formIsValid,
    },
    control,
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      name: client ? client.name : "",
      email: client ? client.email : "",
      phone: client ? client.phone : "",
    },
  });

  const { phone } = watch();

  const { isValid } = getPhoneData(phone); // Assuming this is a utility function

  useEffect(() => {
    if (!cart.length) setShowCalendar(false);
  }, [cart.length]);

  async function onSubmit(data: Inputs) {
    dispatch(setClient(data));
  }

  return (
    <motion.div className="  w-full sm:max-w-[600px] mx-auto  lg:w-[350px] overflow-hidden">
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-2 p-3 rounded-md  flex-1 bg-secondary dark:bg-card/30 h-fit"
      >
        {/* Full Name Field */}
        <motion.div className="space-y-1">
          <Label htmlFor="fullname">Full name</Label>
          <Input
            id="fullname"
            placeholder="Full name"
            className=" border-none bg-background"
            type="text"
            {...register("name", {
              required: "Please put a valid full name.",
              validate: (value) => {
                const string = value.split(" ");
                const validValue =
                  value.includes(" ") && string[string.length - 1];
                return !validValue
                  ? "Please enter you first and last name."
                  : undefined;
              },
            })}
          />
          <AnimatePresence mode="wait">
            {errors.name && (
              <FormErrorMessage key={errors.name.message}>
                {errors.name.message}
              </FormErrorMessage>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Phone Field */}
        <motion.div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Controller
            control={control}
            rules={{
              required: "Please input a valid phone number",
            }}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                id="phone"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <AnimatePresence>
            {(errors.phone || isValid === false) && (
              <FormErrorMessage>
                {errors?.phone?.message || "Phone is invalid"}.
              </FormErrorMessage>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email Field */}
        <motion.div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Email"
            className=" border-none bg-background"
            type="text"
            {...register("email", {
              required: "Please put a valid email address.",
              min: 5,
              max: 67,
            })}
          />
          <AnimatePresence>
            {errors.email && (
              <FormErrorMessage>{errors.email.message}</FormErrorMessage>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      <AnimatePresence mode="popLayout">
        {showCalendar && (
          <PickupDate
            diffInDate={diffInDates}
            exceedsPeriod={periodExceeds}
            setShowCalendar={setShowCalendar}
            date={date}
            // setDate={(value) => dispatch(setDate(value))}
          />
        )}
      </AnimatePresence>

      <motion.div layout className=" flex flex-col gap-2 my-2 ">
        <Button
          size="sm"
          className="gap-2"
          disabled={isSubmitting || !formIsValid || !cart.length}
          onClick={() => {
            if (date) {
              submitForm();
              router.push("/success");
            } else {
              setShowCalendar((is) => !is);
            }
          }}
        >
          {date ? "Continue" : "I will pick it up"}{" "}
          <CiDeliveryTruck size={16} />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className=" gap-2"
          disabled={isSubmitting || !formIsValid || !cart.length}
          onClick={() => {
            submitForm();
            router.push("/stripe");
          }}
        >
          Pay By Card <FaCcMastercard size={16} /> <FaCcPaypal size={16} />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CartClientForm;

interface PickupDateProps {
  diffInDate?: string | undefined;
  exceedsPeriod?: boolean;
  date: string | undefined;
  setShowCalendar: React.Dispatch<SetStateAction<boolean>>;
  // setDate: React.Dispatch<SetStateAction<Date | undefined>>;
}

const PickupDate = forwardRef<HTMLDivElement, PickupDateProps>(
  ({ exceedsPeriod, diffInDate, date, setShowCalendar }, ref) => {
    const dispatch = useDispatch();
    const chosenDate = date ? format(date, "PPP") : undefined;
    const isPastDate = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Remove time part to compare only dates
      return date < today;
    };
    return (
      <motion.div
        // layout
        ref={ref}
        className=" my-4  relative w-full text-center text-balance"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
      >
        <button
          onClick={() => {
            dispatch(setDate(undefined));
            setShowCalendar(false);
          }}
          className="absolute right-1 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <Cross2Icon className="h-4 w-4" />
          {/* <span className="sr-only">Close</span> */}
        </button>
        <p className=" text-sm text-muted-foreground mb-1 w-full break-words  ">
          What date should we expect you to arrive at?
          <br />
          {`${chosenDate || ""} ${diffInDate ? ", " + diffInDate : ""}`}
        </p>
        <AnimatePresence>
          {exceedsPeriod && (
            <motion.p
              layout
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className=" text-xs text-yellow-600 mb-1 dark:text-yellow-500"
            >
              We can&apos;t guarantee that the items in the cart will be
              available past the 31 days mark.
            </motion.p>
          )}
        </AnimatePresence>
        <Calendar
          mode="single"
          selected={date ? new Date(date) : undefined}
          disabled={isPastDate}
          onSelect={(value) => dispatch(setDate(value?.toISOString()))}
          className="rounded-md border w-fit mx-auto"
        />
      </motion.div>
    );
  }
);

PickupDate.displayName = "PickupDate";
