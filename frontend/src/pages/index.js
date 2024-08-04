import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleViewClimbs = () => {
    console.log('Navigating to /climbs');
    router.push('/climbs');
  };

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Welcome to ClimbTanzania!</h1>
          <p style={styles.textBlock}>This is the homepage of ClimbTanzania.</p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '60px', // Ensure there's space for the footer
  },
  content: {
    width: '80%',
    maxWidth: '800px',
    textAlign: 'center',
    padding: '20px',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '32px',
    paddingBottom: '10px',
  },
  textBlock: {
    marginBottom: '20px',
    lineHeight: '1.6',
    fontSize: '18px',
  },
  link: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    marginRight: '10px', // Add margin for spacing between links
    cursor: 'pointer',
  },
};
