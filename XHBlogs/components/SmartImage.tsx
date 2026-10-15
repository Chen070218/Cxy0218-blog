"use client";

import Image from 'next/image';
import React from 'react';

/** 允许走 Next 图片优化的远程主机（自己的图床） */
const ALLOWED_REMOTE_HOSTS = ['bu.dusays.com'];

type SmartImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** fill 模式：配合 position:relative 的父容器铺满（父容器要有确定尺寸/比例） */
  fill?: boolean;
  /** 非 fill 模式下的尺寸提示，用于让优化器决定生成哪些尺寸 */
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

function hostOf(url: string) {
  try { return new URL(url).hostname; } catch { return ''; }
}

/**
 * 图片包装：站内图片与自家图床交给 next/image 优化，
 * 其它任意图床（用户在控制台里填的链接、localStorage 里的图片）自动退回原生 img，
 * 这样既拿到优化，又不会因为 hostname 没配而整页报错。
 */
export default function SmartImage({ src, alt = '', className, fill, width = 1200, height = 900, sizes, priority }: SmartImageProps) {
  const isRemote = /^https?:\/\//i.test(src);
  const canOptimize = !isRemote || ALLOWED_REMOTE_HOSTS.includes(hostOf(src));

  if (!canOptimize) {
    return <img src={src} alt={alt} className={className} sizes={sizes} loading={priority ? 'eager' : 'lazy'} decoding="async" />;
  }

  const common = {
    src,
    alt,
    className,
    sizes: sizes || (fill ? '100vw' : undefined),
    priority,
    loading: priority ? undefined : ('lazy' as const),
    decoding: 'async' as const,
  };

  return fill ? <Image {...common} fill /> : <Image {...common} width={width} height={height} />;
}