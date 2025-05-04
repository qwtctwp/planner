import { Typography, Container, Box, Paper, Grid, Button } from '@mui/material';
import Link from 'next/link';

export default function DashboardIndex() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панели управления
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Выберите одну из доступных панелей управления ниже:
        </Typography>
        
        <Grid container spacing={3}>
          {[1, 2, 3].map((id) => (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Панель {id}
                </Typography>
                <Typography variant="body2" paragraph>
                  Информация и статистика по панели управления {id}
                </Typography>
                <Button 
                  component={Link} 
                  href={`/dashboard/${id}`} 
                  variant="contained"
                  fullWidth
                >
                  Открыть
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Box mt={4} textAlign="center">
          <Button component={Link} href="/" variant="outlined">
            Вернуться на главную
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 