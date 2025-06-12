'use client';

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient('https://brainy-kingfisher-980.convex.cloud', {
  unsavedChangesWarning: false,
});

export function DbProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
} 