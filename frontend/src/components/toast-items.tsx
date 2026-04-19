import { BadgeAlert, BadgeCheck } from "lucide-react";
import React, { ReactNode } from "react";

const SuccessToastDescription = ({
  message,
  icon,
}: {
  message: string;
  icon?: ReactNode;
}) => {
  return (
    <div className=" flex items-center gap-2">
      {icon ? icon : <BadgeCheck size={20} />} <span>{message}</span>
    </div>
  );
};

export default SuccessToastDescription;

export const ErorrToastDescription = ({
  error,
  icon,
}: {
  error: string;
  icon?: ReactNode;
}) => {
  return (
    <div className=" flex items-center gap-2">
      {icon ? icon : <BadgeAlert size={20} />} <span>{error}</span>
    </div>
  );
};
