import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * 拼接部署基路径（Vite base）——子路径部署（如 GitHub Pages /apex-admin/）下
 * 资源与站内链接禁止写死根路径（"/logo.svg" 在子路径下会 404），一律经此函数拼接。
 */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
