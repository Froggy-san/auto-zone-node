import React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { cn } from "@/lib/utils"
import { Link } from "react-router"

const PRODUCTS_LINKS: { url: string; name: string }[] = [
  { url: "", name: "Body Parts" },
  { url: "", name: "Brake System" },
  { url: "", name: "Batteries" },
  { url: "", name: "Tools" },
]
const HELP_LINKS: { url: string; name: string }[] = [
  { url: "", name: "Contact Us" },
  { url: "", name: "My Account" },
  { url: "", name: "Return Policies" },
]

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer
      className={cn(
        "mt-44 flex w-full flex-col-reverse justify-center gap-x-20 gap-y-5 p-5 pb-10 sm:flex-row",
        className
      )}
    >
      <section className="w-full sm:hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">
              PRODUCTS
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3">
                {PRODUCTS_LINKS.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={`${link.url}`}
                      className="text-muted-foreground transition-colors duration-300 hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold">
              HELP
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3">
                {HELP_LINKS.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={`${link.url}`}
                      className="text-muted-foreground transition-colors duration-300 hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="hidden w-fit shrink-0 gap-16 sm:flex">
        <div>
          <h3 className="mb-5 font-semibold">PRODUCTS</h3>
          <ul className="space-y-3">
            {PRODUCTS_LINKS.map((link, index) => (
              <li key={index}>
                <Link
                  to={`${link.url}`}
                  className="text-muted-foreground transition-colors duration-300 hover:text-primary"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-semibold">HELP</h3>
          <ul className="space-y-3">
            {HELP_LINKS.map((link, index) => (
              <li key={index}>
                <Link
                  to={`${link.url}`}
                  className="text-muted-foreground transition-colors duration-300 hover:text-primary"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="max-w-[400px] flex-1">
        <img
          src={"../public/autozone-logo.svg"}
          alt="Logo"
          className="w-full"
        />
      </div>
    </footer>
  )
}

export default Footer
