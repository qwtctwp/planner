import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PagesIndex() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправление на главную страницу App Router
    router.push('/');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Загрузка...
    </div>
  );
} 