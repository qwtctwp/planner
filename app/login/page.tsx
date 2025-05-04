'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <LoginForm onLogin={handleLogin} />
      </Box>
    </Container>
  );
} 