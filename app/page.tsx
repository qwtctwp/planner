'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">Загрузка...</Typography>
    </Box>
  );
} 