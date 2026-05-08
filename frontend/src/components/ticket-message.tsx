import { Attachment, Message, User } from "@lib/types"
import { cn } from "@lib/utils"
import { format } from "date-fns"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Ellipsis,
  EllipsisVertical,
  File,
  MessageSquareDashed,
  MessageSquareOff,
  MessageSquareReply,
  Play,
  RotateCcw,
} from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import useDeleteMessage from "@lib/queries/tickets/useDeleteMessage"
import Spinner from "./Spinner"
import { useToast } from "@hooks/use-toast"
import SuccessToastDescription, { ErorrToastDescription } from "./toast-items"
import ViewCarousel from "./view-carousel"
import { downloadFileFromUrl, getInitials } from "@lib/client-helpers"
import { FiExternalLink } from "react-icons/fi"
import { CgInternal } from "react-icons/cg"
import { deleteAttachment } from "@lib/services/ticket"

interface CustomComponentProps extends HTMLMotionProps<"div"> {
  message: Message
  isSelected: boolean
  className?: string
  currentUser?: User | null
  isDragging?: boolean
  isRetrying: boolean
  isFocused: boolean
  setFocusedMessage: (id: number | null) => void
  handleRemoveMessageId: () => void
  handleResend: (message: Message) => Promise<void>
  handleSelect: () => void
}

const FAILED_STYLE =
  "bg-destructive/30 text-destructive-foreground hover:bg-destructive/20"
const MEDIA_FILES = ["image", "video"]

const TicketMessage = React.forwardRef<HTMLDivElement, CustomComponentProps>(
  (
    {
      message,
      className,
      currentUser,
      isDragging,
      isFocused,
      isSelected,
      isRetrying,
      setFocusedMessage,
      handleResend,
      handleRemoveMessageId,
      handleSelect,
      ...props
    },
    ref
  ) => {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const { deleteMessage, isLoading } = useDeleteMessage()
    const [viewedIndex, setViewedIndex] = useState<undefined | number>(
      undefined
    )
    // const [isRetrying, setisRetrying] = useState(false);
    const [deletedAttch, setDeletedAttch] = useState<number[]>([])
    const [loadingIds, setLoadingIds] = useState<number[]>([])
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function handleTouchStart() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        setOpen(true)
      }, 1000)
    }

    function handleTouchEnd() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    const images = useMemo(
      () =>
        message.attachments
          .filter(
            (attachment) =>
              (attachment.file_type.startsWith("image/") ||
                attachment.file_type.startsWith("video/")) &&
              !deletedAttch.includes(attachment.id)
          )
          .map((attachment) => attachment.file_url),
      [message.attachments, deletedAttch]
    )
    const imgAttchments = message.attachments.filter(
      (attachment) =>
        (attachment.file_type.startsWith("image/") ||
          attachment.file_type.startsWith("video/")) &&
        !deletedAttch.includes(attachment.id)
    )

    const audioAttchments = message.attachments.filter(
      (attachment) =>
        attachment.file_type.startsWith("audio/") &&
        !deletedAttch.includes(attachment.id)
    )
    const applicationAttchments = message.attachments.filter(
      (attachment) =>
        attachment.file_type.startsWith("application/") &&
        !deletedAttch.includes(attachment.id)
    )
    const isAdmin = currentUser?.user_metadata.role.toLowerCase() === "admin"
    const isSameSender = message.senderId === currentUser?.id

    useEffect(() => {
      const body = document.querySelector("body")

      if (body) {
        body.style.pointerEvents = "auto"
      }
      return () => {
        if (body) body.style.pointerEvents = "auto"
      }
    }, [deleteOpen])

    const handleDeleteAttachment = useCallback(
      async (attachment: Attachment) => {
        try {
          setLoadingIds((prev) => [...prev, attachment.id])
          await deleteAttachment(attachment)
          setDeletedAttch((prev) => [...prev, attachment.id])
        } catch (error: any) {
        } finally {
          setLoadingIds((prev) => prev.filter((id) => id !== attachment.id))
        }
      },
      [setLoadingIds, setDeletedAttch]
    )

    const handleDownloadFile = useCallback(async (attachment: Attachment) => {
      try {
        setLoadingIds((prev) => [...prev, attachment.id])
        await downloadFileFromUrl(attachment.file_url, attachment.file_name)
      } catch (error: any) {
        console.log(error)
      } finally {
        setLoadingIds((prev) => prev.filter((id) => id !== attachment.id))
      }
    }, [])
    async function handleDelete() {
      try {
        await deleteMessage(message)
        setDeleteOpen(false)
        // toast({
        //   className: "bg-primary  text-primary-foreground",
        //   title: `Done.`,
        //   description: (
        //     <SuccessToastDescription
        //       message={`${
        //         true
        //           ? "Message has been Deteted."
        //           : "You have deleted a user's message and it will be logged into the attachments history."
        //       }`}
        //     />
        //   ),
        // });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: <ErorrToastDescription error={error.message} />,
        })
      }
    }

    return (
      <motion.div
        id={`${message.id}`}
        {...props}
        ref={ref}
        layout={!isDragging}
        initial={{ scale: 0.5, opacity: 0.2 }}
        onClick={() => {
          if (isFocused) {
            handleRemoveMessageId()
            setFocusedMessage(null)
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        className={cn(
          "group relative border-b px-2 py-5",
          {
            "bg-accent/90 dark:bg-accent/40": message.is_internal_note,
            "!bg-primary !text-primary-foreground":
              message.is_internal_note && isFocused,
            "dark:text-destructive-foreground bg-red-200 text-red-800 dark:bg-destructive/30":
              message.status === "failed",
            "bg-secondary/50": isSelected,
            "bg-primary text-primary-foreground": isFocused,
          },

          className
        )}
      >
        <div className="mb-6 flex items-center gap-4">
          {message.client?.picture && (
            <Avatar>
              <AvatarImage src={message.client.picture} />
              <AvatarFallback>
                {getInitials(message.client.name)}
              </AvatarFallback>
            </Avatar>
            // <img
            //   src={message.client?.picture}
            //   alt="Profile-picture"
            //   className=" w-10 h-10 rounded-full "
            // />
          )}
          <div className="flex flex-col">
            <span className="font-semibold">{message.client?.name}</span>
            <span
              className={cn("text-xs font-semibold text-muted-foreground", {
                "text-primary-foreground/80": isFocused,
              })}
            >
              {format(message.created_at, "MMMM d, yyyy h:mm bb")}
            </span>
          </div>
        </div>
        <p
          className={cn("mb-6 break-all", {
            "mb-0": !message.attachments.length,
          })}
        >
          {message.content}
        </p>

        {imgAttchments.length ? (
          <div
            className={cn(
              "mb-6 grid w-fit grid-cols-2 flex-wrap items-center justify-center gap-1 rounded-xl bg-accent/30 p-3 shadow-md sm:grid-cols-3",
              {
                "grid-cols-2 sm:grid-cols-2": imgAttchments.length < 3,
                "grid-cols-1 sm:grid-cols-1": imgAttchments.length <= 1,
              }
            )}
          >
            {imgAttchments.map((imgAttchments, index) => (
              <MediaItem
                key={imgAttchments.id}
                isSameSender={isSameSender}
                pending={message.status === "pending"}
                isFailed={message.status === "failed"}
                isLoading={loadingIds.includes(imgAttchments.id)}
                setDeletedAttch={setDeletedAttch}
                handleDeleteAttachment={() =>
                  handleDeleteAttachment(imgAttchments)
                }
                handleDownloadFile={() => handleDownloadFile(imgAttchments)}
                className="h-20 max-w-36 xs:h-40 sm:h-48"
                attachment={imgAttchments}
                handleSelectFile={() => setViewedIndex(index)}
              />
            ))}
          </div>
        ) : null}

        {audioAttchments.length ? (
          <div className="mb-6 space-y-2">
            {audioAttchments.map((audio, i) => (
              <MediaItem
                key={audio.id}
                isSameSender={isSameSender}
                pending={message.status === "pending"}
                isFailed={message.status === "failed"}
                isLoading={loadingIds.includes(audio.id)}
                handleDeleteAttachment={() => handleDeleteAttachment(audio)}
                handleDownloadFile={() => handleDownloadFile(audio)}
                className=" "
                attachment={audio}
                handleSelectFile={() => setViewedIndex(i)}
              />
              // <audio
              //   key={audio.id}
              //   controls
              //   src={audio.file_url}
              //   className="  max-w-full text-primary "
              // ></audio>
            ))}
          </div>
        ) : null}

        {applicationAttchments.length ? (
          <div className="space-y-2">
            {applicationAttchments.map((attch, i) => (
              <MediaItem
                key={attch.id}
                isSameSender={isSameSender}
                pending={message.status === "pending"}
                isFailed={message.status === "failed"}
                isLoading={loadingIds.includes(attch.id)}
                handleDeleteAttachment={() => handleDeleteAttachment(attch)}
                handleDownloadFile={() => handleDownloadFile(attch)}
                attachment={attch}
                handleSelectFile={() => setViewedIndex(i)}
              />
            ))}
          </div>
        ) : null}
        {message.status === "pending" ? (
          <div className="mt-2 flex items-center gap-1">
            <Spinner className="static h-4 w-4" />{" "}
            <span className="text-xs"> Sending</span>
          </div>
        ) : message.status === "failed" ? (
          <div className="flex items-center gap-1 text-xs">
            {" "}
            <Button
              disabled={isRetrying}
              onClick={async () => await handleResend(message)}
              variant="destructive"
              size="sm"
              className="text-destructive-foreground gap-2 bg-destructive dark:bg-red-950 dark:hover:bg-red-800/50"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`ind-${isRetrying}`}
                  layout
                  initial={{
                    // rotate: !isRetrying ? "120deg" : 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    // rotate: !isRetrying ? "120deg" : 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  // transition={{ rotate: { delay: 0.01 } }}
                  className="text-red-100"
                >
                  {" "}
                  {isRetrying ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  layout
                  key={`word-${isRetrying}`}
                  initial={{ y: 10, opacity: 0.2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-red-100"
                >
                  {isRetrying ? "Resending" : "Failed to send"}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        ) : null}
        {isSameSender && (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger disabled={isLoading} asChild>
              <Button
                disabled={isLoading}
                className={cn(
                  "remove-on-touch-divces pointer-events-none absolute top-3 right-3 h-7 w-7 rounded-full p-0 opacity-0 transition-all duration-300 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:opacity-100",
                  {
                    "pointer-events-none opacity-100": isLoading,
                    "!pointer-events-none !opacity-55":
                      message.status === "pending",
                    "pointer-events-auto opacity-100": open,
                    "hover:text-destructive-foreground text-destructive-foreground bg-destructive hover:bg-destructive/90 dark:bg-red-950 dark:hover:bg-red-800/50":
                      message.status === "failed",
                  }
                )}
                variant="ghost"
              >
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Ellipsis className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className={cn("", {
                "border-red-500 bg-destructive dark:border-red-950 dark:!bg-red-950":
                  message.status === "failed",
              })}
              // style={{ backgroundColor: "hsl(1.94deg 50.82% 11.96%)" }}
            >
              <DropdownMenuItem
                onClick={handleSelect}
                className={cn("flex items-center justify-between gap-2", {
                  "!text-destructive-foreground hover:!bg-red-800 dark:!text-red-100 dark:hover:!bg-destructive/60":
                    message.status === "failed",
                })}
              >
                {" "}
                Edit{" "}
                <span>
                  <MessageSquareDashed className="h-4 w-4" />
                </span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
            Forward{" "}
            <span>
              <MessageSquareReply className=" w-4 h-4" />
            </span>{" "}
          </DropdownMenuItem> */}
              <DropdownMenuItem
                className={cn("flex items-center justify-between gap-2", {
                  "!text-destructive-foreground hover:!bg-red-800 dark:!text-red-100 dark:hover:!bg-destructive/60":
                    message.status === "failed",
                })}
              >
                {message.is_internal_note
                  ? "Set as visible"
                  : "Set as internal"}
                <span>
                  {message.is_internal_note ? (
                    <FiExternalLink className="h-4 w-4" />
                  ) : (
                    <CgInternal className="h-4 w-4" />
                  )}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator
                className={cn("", {
                  "bg-red-900/50": message.status === "failed",
                })}
              />
              <DropdownMenuItem
                className={cn("flex items-center justify-between gap-2", {
                  "!text-destructive-foreground hover:!bg-red-800 dark:!text-red-100 dark:hover:!bg-destructive/60":
                    message.status === "failed",
                })}
                onClick={() => setDeleteOpen(true)}
              >
                Unsend{" "}
                <span>
                  <MessageSquareOff className="h-4 w-4" />
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-y-2">
              <DialogClose>
                <Button size="sm" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button onClick={handleDelete} size="sm" variant="destructive">
                {isLoading ? <Spinner /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AnimatePresence>
          {viewedIndex !== undefined && (
            <ViewCarousel
              closeFunction={() => setViewedIndex(undefined)}
              images={images}
              index={viewedIndex}
            />
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

TicketMessage.displayName = "TicketMessage"
export default TicketMessage

const VIEW_TYPES = ["image", "video"]

interface MediaProps {
  attachment: Attachment
  handleSelectFile?: () => void
  handleDeleteAttachment: () => void
  handleDownloadFile: () => void
  isSameSender: boolean
  isFailed: boolean
  isLoading: boolean
  pending: boolean
  setDeletedAttch?: React.Dispatch<React.SetStateAction<number[]>>
  className?: string
}

const MediaItem = React.forwardRef<HTMLDivElement, MediaProps>(
  (
    {
      attachment,
      isLoading,
      setDeletedAttch,
      handleSelectFile,
      isSameSender,
      pending,
      handleDeleteAttachment,
      handleDownloadFile,
      isFailed,
      className,
      ...props
    },
    ref
  ) => {
    const [menuOpen, setMenuOpen] = useState(false)
    // const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
      e.stopPropagation()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        setMenuOpen(true)
      }, 1000)
    }

    function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
      e.stopPropagation()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    return (
      <div
        {...props}
        ref={ref}
        // layout
        onClick={() => {
          if (VIEW_TYPES.includes(attachment.file_type.split("/")[0]))
            handleSelectFile?.()
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "media-container relative transition-all focus:border-4",
          { "pointer-events-none animate-pulse": isLoading },
          className
        )}
      >
        {attachment.file_type.startsWith("image/") ? (
          <img
            loading="lazy"
            key={attachment.id}
            src={attachment.file_url}
            alt={attachment.file_name}
            className="media-file"
          />
        ) : attachment.file_type.startsWith("video/") ? (
          <>
            <video
              key={attachment.id}
              src={attachment.file_url}
              className="media-file"
            >
              <source src={attachment.file_url} type={attachment.file_type} />
            </video>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 p-3">
              <Play className="h-7 w-7" />
            </span>
          </>
        ) : attachment.file_type.startsWith("audio/") ? (
          <audio
            controls
            src={attachment.file_url}
            className="max-w-full text-primary"
          ></audio>
        ) : attachment.file_type.startsWith("application/") ? (
          <div className="flex gap-2 rounded-lg bg-accent/30 px-3 py-[0.5rem]">
            <File className="h-6 w-6" /> <span>{attachment.file_name}</span>
          </div>
        ) : null}

        {!pending &&
          !isFailed &&
          (isLoading ? (
            <Spinner className="absolute top-1 right-1 h-7 w-7 shadow-md" />
          ) : !isSameSender ? (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadFile()
              }}
              variant="secondary"
              className="media-container-download absolute top-1 right-1 h-7 w-7 rounded-full p-0 shadow-md"
            >
              {" "}
              <Download className="h-4 w-4" />
            </Button>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="remove-on-touch-divces media-container-menu-btn absolute top-1 right-1 h-7 w-7 rounded-full p-0 shadow-md"
                  >
                    {" "}
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleDownloadFile}>
                    Download file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteAttachment}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
      </div>
    )
  }
)
MediaItem.displayName = "MediaItem"
