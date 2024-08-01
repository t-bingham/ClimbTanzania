import React from 'react';
import { useRouter } from 'next/router';
import Header from './header';
import Footer from './footer';

const Layout = ({ children }) => {
  const router = useRouter();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (router.pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    marginTop: '70px', // Adjust this value to match the height of your header
  },
};

export default Layout;
