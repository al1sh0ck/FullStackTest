import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { getJwtToken } from '../utils/auth';

const protectedRoutes = ['/tasks']; // Защищенные маршруты

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const token = getJwtToken();
    const isProtectedRoute = protectedRoutes.includes(router.pathname);

    if (isProtectedRoute && !token) {
      router.push('/sign-in');
    }

    // Если пользователь авторизован и пытается зайти на sign-in/sign-up
    if ((router.pathname === '/sign-in' || router.pathname === '/sign-up') && token) {
      router.push('/tasks');
    }
  }, [router.pathname]);

  return (
    <MantineProvider
      theme={{
        fontFamily: 'Inter, sans-serif',
        primaryColor: 'blue',
        primaryShade: 6,
        components: {
          Button: {
            defaultProps: {
              radius: 'md',
            },
          },
          Input: {
            defaultProps: {
              radius: 'md',
            },
          },
          Card: {
            styles: {
              root: {
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                  boxShadow: 'var(--mantine-shadow-md)',
                },
              },
            },
          },
        },
      }}
      defaultColorScheme="light"
    >
      <Notifications position="top-right" zIndex={1000} />
      <Component {...pageProps} />
    </MantineProvider>
  );
}