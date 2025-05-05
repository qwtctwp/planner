import { Suspense } from 'react';

export default function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading subjects...</div>}>
      {children}
    </Suspense>
  );
} 