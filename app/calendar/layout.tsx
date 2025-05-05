import { Suspense } from 'react';

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      {children}
    </Suspense>
  );
} 