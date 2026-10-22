import Image, { type ImageProps } from "next/image";

/** Static-export responsive sources, with no image service or client processing. */
export default function ResponsivePhoto({ srcSet, sizes, alt, ...props }: ImageProps & { srcSet: string }) {
  return <picture><source type="image/webp" srcSet={srcSet} sizes={sizes} /><Image {...props} alt={alt} unoptimized sizes={sizes} /></picture>;
}
