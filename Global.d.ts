
/**
 * Next.js only!
 */
declare module '*.module.css' {
	const content: Record<string, string>;
	export default content;
}

/**
 * Next.js only!
 */
declare module '*.css' {
	export default undefined;
}


declare module '*.jpg' {
  export const src: string
  export const height: number
  export const width: number
  export const constblurDataURL: string
  export const blurWidth: number
  export const blurHeight: number
}