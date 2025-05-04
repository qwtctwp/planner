import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Студенческий планировщик
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Веб-приложение для организации учебного процесса, которое помогает студентам 
            управлять своим расписанием, заданиями и задачами.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>Календарь</Typography>
              <Typography>
                Удобный интерфейс для просмотра и планирования расписания занятий с поддержкой 
                дневного, недельного и месячного представлений.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>Задания</Typography>
              <Typography>
                Управляйте домашними заданиями, отслеживайте сроки выполнения и 
                приоритеты для каждого предмета.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>Аналитика</Typography>
              <Typography>
                Визуализация учебной нагрузки и прогресса выполнения заданий для оптимизации
                вашего учебного процесса.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Это демонстрационная версия проекта на GitHub Pages.
          </Typography>
          <Typography paragraph>
            Для полноценного использования приложения требуется локальная установка 
            с настройкой базы данных PostgreSQL и переменных окружения.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            component="a" 
            href="https://github.com/qwtctwp/diploma"
            target="_blank"
            sx={{ mt: 2 }}
          >
            Открыть репозиторий GitHub
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 