import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Service } from "@/types"
import { Link } from "react-router"

const ClientDialog = ({ service }: { service: Service }) => {
  const client = service.user

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/dashboard/customers?name=${client.username}`}
            className="w-fit text-nowrap"
          >
            {client.username}
          </Link>
        </TooltipTrigger>
        <TooltipContent>View {client.username}&apos;s details.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ClientDialog
