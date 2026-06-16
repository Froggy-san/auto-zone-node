export const AUTH_TOEKN_NAME = "auto-zone-token"
export const TAX_PER = 14
export const DEFAULT_CAR_LOGO =
  "https://mywarsha.blob.core.windows.net/mywarshaimages/8005f9f6-2be7-49aa-a506-c4984bc8d8cc.jpg"

export const PAGE_SIZE = 12
export const MAKER_PAGE_SIZE = 24
export const PILL_SIZE = 30
export const byteSize = 1048576
export const MIN_PASS_LENGTH = 6

export const DEL_ACC_DAYS = 1
export const DEFAULT_PRODUCT_PIC =
  "https://mywarsha.blob.core.windows.net/mywarshaimages/Product-inside.png"
export const STATIC_IMAGES = [
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.1257265497553366-448814389_122157382592181555_8517678768345414919_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.22337137047383426-449942924_783476877236875_3282549891675463112_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.34432551927525545-449186742_989589682574123_5705111175156521882_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.365694995834676-450801928_122185965308031351_3973663162623189835_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.4160722142697284-FB_IMG_1715907147440.jpg",
]

export const SER_STATUS_DONE_ID = "6a088a4c2189462c9b1d98e0"
export const SER_STATUS_IN_PROGRESS = "6a088a972189462c9b1d98e1"
export const SER_STATUS_CANCELED = "6a088ab62189462c9b1d98e2"
export const SER_STATUS_PENDING = "6a088ad32189462c9b1d98e3"
export const SER_STATUS_RETURNED = "6a20b9c6c2662d7b6a2f1494"
// Variants for slide transitions; "direction" is passed as a custom prop.
export const ProFormSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300, // Adjust these values as needed
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

export const ProFormTransition: any = {
  x: { type: "spring", stiffness: 300, damping: 26, duration: 4 },
  opacity: { duration: 0.5 },
}

export const SUPABASE_URL = "https://umkyoinqpknmedkowqva.supabase.co"

// /app/user/[userID]
export const maxSize = 1000000
export const maxFiles = 1

export const BASE_URL = import.meta.env.VITE_API_URL
