import React, { SetStateAction, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@components/ui/button"
import { Check, Ellipsis, Menu, MoveRight, Search } from "lucide-react"

import { ClickAwayListener } from "@mui/material"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const inputStyle =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50  pr-9"

type fieldName = "email" | "name"

const ClientSearch = ({
  currPage,
  name,
  email,
  phone,
}: {
  currPage: string
  name: string
  email: string
  phone: string
}) => {
  const [fieldName, setFieldName] = useState<fieldName>("name")
  const [open, setOpen] = useState(false)
  const [nameValue, setNameValue] = useState(name)
  const [emailValue, setEmailValue] = useState(email)
  const [phoneValue, setPhoneValue] = useState(phone)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const page = Number(currPage)

  async function handleSub() {
    const name = nameValue.trim()
    const phone = phoneValue.trim()
    const email = emailValue.trim()
    const params = new URLSearchParams(searchParams)
    // if (!name.length && !phone.length && !email.length) return;

    if (page > 1) params.set("page", String(page - 1))

    if (!name.length) {
      params.delete("name")
    } else {
      params.set("name", name)
    }
    if (!phone.length) {
      params.delete("phone")
    } else {
      params.set("phone", phone)
    }
    if (!email.length) {
      params.delete("email")
    } else {
      params.set("email", email)
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setOpen(false)
  }

  return (
    <ClickAwayListener
      onClickAway={() => {
        setOpen(false)
      }}
    >
      <div className="relative mb-7 flex h-[20px] items-center justify-between">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cleints-search-bar-mobile z-50 w-[98%] rounded-xl border bg-card p-2 text-card-foreground shadow md:!w-[600px]"
            >
              <motion.form
                action={handleSub}
                className="flex items-center gap-2"
              >
                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <div className="relative w-full min-w-[200px]">
                    <AnimatePresence mode="popLayout">
                      {fieldName === "name" && (
                        <motion.input
                          autoFocus
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          type="text"
                          initial={{
                            opacity: 0,
                          }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={inputStyle}
                          placeholder="Name"
                        />
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout">
                      {fieldName === "email" && (
                        <motion.input
                          initial={{
                            opacity: 0,
                          }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          autoFocus
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                          type="text"
                          className={inputStyle}
                          placeholder="Email"
                        />
                      )}
                    </AnimatePresence>
                    <SearchDropDown
                      fieldName={fieldName}
                      setFieldName={setFieldName}
                    />
                  </div>

                  <motion.input
                    initial={{
                      opacity: 0,
                    }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    placeholder="Phone"
                    className={`w-full sm:!w-[full] md:!w-[200px] ${inputStyle}`}
                  />
                </div>

                <Button
                  //   onClick={() => setOpen((open) => !open)}
                  className="h-8 w-8 p-0"
                  variant="outline"
                >
                  <MoveRight size={15} />
                </Button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setOpen((open) => !open)}
          className="absolute top-1/2 right-0 h-8 w-8 -translate-y-1/2 p-0"
          variant="outline"
        >
          <Search size={15} />
        </Button>
      </div>
    </ClickAwayListener>
  )
}

const SearchDropDown = React.forwardRef(
  (
    {
      fieldName,
      setFieldName,
    }: {
      fieldName: fieldName
      setFieldName: React.Dispatch<SetStateAction<fieldName>>
    },
    ref?: React.Ref<HTMLDivElement>
  ) => {
    const [open, setOpen] = useState(false)
    return (
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div
          ref={ref}
          className="absolute top-1/2 right-3 z-50 h-6 w-6 -translate-y-1/2 p-0"
        >
          <div className="relative">
            <Button
              type="button"
              onClick={() => setOpen((open) => !open)}
              variant="outline"
              className="h-7 w-7 rounded-full p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: 5, x: "-50%" }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    x: "-50%",
                    transition: { duration: 0.1 },
                  }}
                  className="absolute left-1/2 w-[150px] -translate-x-1/2 rounded-lg border bg-background p-1 text-xs text-foreground"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => {
                      setOpen(false)
                      if (fieldName === "name") return
                      setFieldName("name")
                    }}
                  >
                    Name
                    {fieldName === "name" && (
                      <span>
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => {
                      setOpen(false)
                      if (fieldName === "email") return
                      setFieldName("email")
                    }}
                  >
                    Email
                    {fieldName === "email" && (
                      <span>
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ClickAwayListener>
    )
  }
)
SearchDropDown.displayName = "SearchDropDown"

export default ClientSearch

// "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
//         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
