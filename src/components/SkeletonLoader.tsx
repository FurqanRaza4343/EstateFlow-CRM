/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({ count = 1, height = '40px', className = '' }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          style={{ height }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
