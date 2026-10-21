"use client";

import Image from 'next/image';
import React from 'react';

import { withBasePath } from '@/sitePath';

/** Remote hosts allowed through Next image optimization (my own image host) */
const ALLOWED_REMOTE_HOSTS = ['bu.dusays.com'];

type SmartImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** fill mode: fills a position:relative parent (the parent needs a definite size/ratio) */
  fill?: boolean;
  /** Size hint in non-fill mode, so the optimizer can decide which sizes to generate */
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

function hostOf(url: string) {
  try { return new URL(url).hostname; } catch { return ''; }
}

/**
 * Image wrapper: in-site images and my own image host go through next/image optimization,
 * while any other host (links typed into the console, images in localStorage) falls back to a native img,
 * so we get the optimization without erroring the whole page when the hostname is not configured.
 */
export default function SmartImage({ src, alt = '', className, fill, width = 1200, height = 900, sizes, priority }: SmartImageProps) {
  // With a static export (output: 'export' + unoptimized) next/image does not add basePath itself,
  // so we add it once here; without a configured basePath it returns the URL unchanged.
  const finalSrc = withBasePath(src);
  const isRemote = /^https?:\/\//i.test(finalSrc);
  const canOptimize = !isRemote || ALLOWED_REMOTE_HOSTS.includes(hostOf(finalSrc));

  if (!canOptimize) {
    return <img src={finalSrc} alt={alt} className={className} sizes={sizes} loading={priority ? 'eager' : 'lazy'} decoding="async" />;
  }

  const common = {
    src: finalSrc,
    alt,
    className,
    sizes: sizes || (fill ? '100vw' : undefined),
    priority,
    loading: priority ? undefined : ('lazy' as const),
    decoding: 'async' as const,
  };

  return fill ? <Image {...common} fill /> : <Image {...common} width={width} height={height} />;
}
