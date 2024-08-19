import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
  
        const profileRes = await fetch('${process.env.NEXT_PUBLIC_API_URL}/users/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });
  
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const userId = profileData.id.toString(); // Convert userId to string
          localStorage.setItem('userId', userId); // Store userId in localStorage
  
         // Redirect to the home page
          router.push('/');
        } else {
          setError('Failed to fetch user profile');
        }
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Invalid username or password');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };
  

  const handleSignup = () => {
    router.push('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Log in to continue to ClimbTanzania</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <div style={styles.signupContainer}>
          <p style={styles.signupText}>Don't have an account?</p>
          <button onClick={handleSignup} style={styles.signupButton}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#777',
    marginBottom: '20px',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  button: {
    width: '100%',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  signupContainer: {
    marginTop: '20px',
  },
  signupText: {
    fontSize: '14px',
    color: '#777',
  },
  signupButton: {
    marginTop: '10px',
    width: '100%',
    padding: '10px 20px',
    borderRadius: '4px',
    border: '1px solid #0070f3',
    backgroundColor: '#fff',
    color: '#0070f3',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};
