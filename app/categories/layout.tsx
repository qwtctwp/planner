import { Suspense } from 'react';

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading categories...</div>}>
      {children}
    </Suspense>
  );
} 