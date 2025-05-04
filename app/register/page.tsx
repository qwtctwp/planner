'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import RegisterForm from '../components/Auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();

  const handleRegister = async (name: string, email: string, password: string) => {
    await register(name, email, password);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <RegisterForm onRegister={handleRegister} />
      </Box>
    </Container>
  );
} 