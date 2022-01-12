/// <reference types="@sveltejs/kit" />

// we have to declare the .mjs file (despite a typing existing) because typescript doesnt map this to svelte-icon/index.d.ts
declare module "svelte-icon/index.mjs" {
  export interface SvelteIconProps {
    data: string
    viewBox?: string
    
    size?: string
    width?: string
    height?: string

    color?: string
    stroke?: string
    fill?: string

    [key: string]: unknown
  }

  export default class Icon {
    $$prop_def: SvelteIconProps
  }
}
