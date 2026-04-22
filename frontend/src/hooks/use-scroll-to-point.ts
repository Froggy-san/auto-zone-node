import { useCallback, RefObject } from "react";

type Positions = "center" | "nearest" | "start" | "end";
type Behaviour = "smooth" | "instant" | "auto";

// Define the Props for alignToTop
interface AlignToTopProps {
  ref: RefObject<HTMLElement>;
  alignToTop?: boolean;
  options?: never; // Ensure options is not provided
}

// Define the Props for options
interface OptionsProps {
  ref: RefObject<HTMLElement>;
  alignToTop?: never; // Ensure alignToTop is not provided
  options?: {
    block?: Positions;
    inline?: Positions;
    behavior?: Behaviour;
  };
}

type Props = AlignToTopProps | OptionsProps;

export default function useScrollToPoint({
  ref,
  options,
  alignToTop = true,
}: Props): () => void {
  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    if (alignToTop) {
      ref.current.scrollIntoView(alignToTop);
      return;
    }
    if (options) {
      ref.current.scrollIntoView(options);
      return;
    }
    ref.current.scrollIntoView({ behavior: "smooth" });
  }, [ref, options, alignToTop]);

  return handleScroll;
}

// How to use:
// the hook accepts either the alignToTop which is a boolean value or the options props.
// 1. const myRef = useRef(null)
// const returnedFn = useScrollToPoint({ref:myRef , options:{behaviour:"smooth",inline:"nearest",block:"nearest"}})    ||     const returnedFn = useScrollToPoint({ref:myRef ,alignToTo:true})
// in the JSX you should have a div as the scrolling point like shown in the example below:
// return<>
// <div ref={myRef}/>
// <ul>
// {list.map((item)=> <ItemComp key={item.id}/>)}
// </ul>
// </>
