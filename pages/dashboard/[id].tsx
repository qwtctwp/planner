import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Typography, Container, Box, CircularProgress, Paper, Button } from '@mui/material';
import Link from 'next/link';

// Это функция, которая будет генерировать статические пути при сборке
export async function getStaticPaths() {
  // Здесь можно получить данные из API или базы данных
  // В этом примере мы просто задаем несколько предопределенных ID
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
    { params: { id: '3' } },
  ];

  return {
    paths,
    // fallback: false означает, что страницы с другими ID будут возвращать 404
    // fallback: true позволит создавать страницы по запросу
    fallback: true,
  };
}

// Эта функция будет вызвана для каждого пути из getStaticPaths
export async function getStaticProps({ params }) {
  try {
    // В реальном приложении здесь был бы запрос к API или базе данных
    const dashboardData = {
      id: params.id,
      title: `Панель управления ${params.id}`,
      description: `Это данные для панели управления с ID: ${params.id}`,
      createdAt: new Date().toISOString(),
    };

    return {
      props: {
        dashboardData,
      },
      // Опционально: время в секундах после которого страница будет перегенерирована
      // revalidate: 60, // ISR - Incremental Static Regeneration
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

export default function DashboardPage({ dashboardData }) {
  const router = useRouter();

  // Если страница еще не сгенерирована, показываем загрузчик
  if (router.isFallback) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {dashboardData.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {dashboardData.description}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Создано: {new Date(dashboardData.createdAt).toLocaleDateString()}
        </Typography>

        <Box mt={4}>
          <Button component={Link} href="/dashboard/1" variant="contained" sx={{ mr: 2 }}>
            Панель 1
          </Button>
          <Button component={Link} href="/dashboard/2" variant="contained" sx={{ mr: 2 }}>
            Панель 2
          </Button>
          <Button component={Link} href="/dashboard/3" variant="contained" sx={{ mr: 2 }}>
            Панель 3
          </Button>
          <Button component={Link} href="/" variant="outlined" sx={{ mt: { xs: 2, sm: 0 } }}>
            На главную
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 