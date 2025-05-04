import React from 'react';
import './globals.css';
import './fullcalendar.css';
import './time-column.css';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  preload: true
});

export const metadata = {
  title: 'Личный планер',
  description: 'Планировщик для учащихся с календарем и управлением заданиями',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <Providers>
            {children}
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
} 