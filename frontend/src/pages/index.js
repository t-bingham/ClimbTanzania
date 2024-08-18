import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import withAuth from '../hoc/withAuth';

function Home() {
  const [recentTicks, setRecentTicks] = useState([]);
  const [recentFirstAscents, setRecentFirstAscents] = useState([]);
  const [recentBigTicks, setRecentBigTicks] = useState([]);

  useEffect(() => {
    const fetchRecentTicks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/logs/recent?limit=10');
        setRecentTicks(response.data);
      } catch (error) {
        console.error('Error fetching recent ticks:', error);
      }
    };

    const fetchRecentFirstAscents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/climbs/recent/first-ascents?limit=5');
        setRecentFirstAscents(response.data);
      } catch (error) {
        console.error('Error fetching recent first ascents:', error);
      }
    };

    const fetchRecentBigTicks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/logs/recent_big_ticks?limit=5');
        setRecentBigTicks(response.data);
      } catch (error) {
        console.error('Error fetching recent big ticks:', error);
      }
    };

    fetchRecentTicks();
    fetchRecentFirstAscents();
    fetchRecentBigTicks();
  }, []);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Welcome to ClimbTanzania!</h1>
          <p style={styles.textBlock}>This is the homepage of ClimbTanzania.</p>

          {/* Recent Ticks */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent Ticks</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Tick Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTicks.map(tick => (
                  <tr key={tick.id}>
                    <td>
                      <Link href={`/profile/${tick.user_id}`}>
                        <span style={styles.link}>{tick.username}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/node/${tick.climb_id}`}>
                        <span style={styles.link}>{tick.name}</span>
                      </Link>
                    </td>
                    <td>{tick.grade || 'N/A'}</td>
                    <td>{tick.date}</td>
                    <td>{tick.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent First Ascents */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent First Ascents</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>First Ascent Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentFirstAscents.map(climb => (
                  <tr key={climb.id}>
                    <td>
                      <Link href={`/profile/${climb.user_id}`}>
                        <span style={styles.link}>{climb.username}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/node/${climb.id}`}>
                        <span style={styles.link}>{climb.name}</span>
                      </Link>
                    </td>
                    <td>{climb.grade || 'N/A'}</td>
                    <td>{climb.first_ascent_date}</td>
                    <td>{climb.type || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Big Ticks */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent Big Ticks</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Tick Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentBigTicks.map(tick => (
                  <tr key={tick.id}>
                    <td>
                      <Link href={`/profile/${tick.user_id}`}>
                        <span style={styles.link}>{tick.username}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/node/${tick.climb_id}`}>
                        <span style={styles.link}>{tick.name}</span>
                      </Link>
                    </td>
                    <td>{tick.grade || 'N/A'}</td>
                    <td>{tick.date}</td>
                    <td>{tick.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}

export default withAuth(Home);

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
  section: {
    marginTop: '40px',
    textAlign: 'left',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: '24px',
    marginBottom: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
