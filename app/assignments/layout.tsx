import { Suspense } from 'react';

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading assignments...</div>}>
      {children}
    </Suspense>
  );
} 