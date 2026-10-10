import Image, { type ImageProps } from "next/image";

const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

/**
 * next/image that optimises local and Supabase Storage images, and passes any
 * other https image (pasted by an admin) through untouched.
 */
export function Media({ src, alt, unoptimized, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const optimizable = src.startsWith("/") || src.startsWith(STORAGE_PREFIX);
  return <Image src={src} alt={alt} unoptimized={unoptimized ?? !optimizable} {...props} />;
}
