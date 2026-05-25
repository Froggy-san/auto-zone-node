import { type EmblaOptionsType } from "embla-carousel"

import useEmblaCarousel from "embla-carousel-react"
import { useEffect } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

type PropType = {
  slides?: number[]
  options?: EmblaOptionsType
  children: React.ReactNode
}

const TagCarousel: React.FC<PropType> = (props) => {
  const { slides, options, children } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const pathname = useLocation().pathname
  const [searchParams] = useSearchParams()

  const params = new URLSearchParams(searchParams)
  const currCategory = searchParams.get("categoryId") ?? ""

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
    }
  }, [emblaApi])

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container items-center select-none">
          {children}
        </div>
      </div>
    </section>
  )
}

export default TagCarousel
