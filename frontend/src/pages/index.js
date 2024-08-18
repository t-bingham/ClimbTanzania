import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import withAuth from '../hoc/withAuth';
import styles from '../styles/climbs.module.css';

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
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to ClimbTanzania!</h1>
        <p className={styles.textBlock}>This is the homepage of ClimbTanzania.</p>

        {/* Recent Ticks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Ticks</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.wideColumn}>User</th>
                  <th className={styles.wideColumn}>Name</th>
                  <th className={styles.narrowColumn}>Grade</th>
                  <th className={styles.narrowColumn}>Tick Date</th>
                  <th className={styles.narrowColumn}>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTicks.map(tick => (
                  <tr key={tick.id}>
                    <td className={styles.wideColumn}>
                      <Link href={`/profile/${tick.user_id}`}>
                        <span className={styles.link}>{tick.username}</span>
                      </Link>
                    </td>
                    <td className={styles.wideColumn}>
                      <Link href={`/node/${tick.climb_id}`}>
                        <span className={styles.link}>{tick.name}</span>
                      </Link>
                    </td>
                    <td className={styles.narrowColumn}>{tick.grade || 'N/A'}</td>
                    <td className={styles.narrowColumn}>{tick.date}</td>
                    <td className={styles.narrowColumn}>{tick.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent First Ascents */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent First Ascents</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.wideColumn}>User</th>
                  <th className={styles.wideColumn}>Name</th>
                  <th className={styles.narrowColumn}>Grade</th>
                  <th className={styles.narrowColumn}>First Ascent Date</th>
                  <th className={styles.narrowColumn}>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentFirstAscents.map(climb => (
                  <tr key={climb.id}>
                    <td className={styles.wideColumn}>
                      <Link href={`/profile/${climb.user_id}`}>
                        <span className={styles.link}>{climb.username}</span>
                      </Link>
                    </td>
                    <td className={styles.wideColumn}>
                      <Link href={`/node/${climb.id}`}>
                        <span className={styles.link}>{climb.name}</span>
                      </Link>
                    </td>
                    <td className={styles.narrowColumn}>{climb.grade || 'N/A'}</td>
                    <td className={styles.narrowColumn}>{climb.first_ascent_date}</td>
                    <td className={styles.narrowColumn}>{climb.type || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Big Ticks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Big Ticks</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.wideColumn}>User</th>
                  <th className={styles.wideColumn}>Name</th>
                  <th className={styles.narrowColumn}>Grade</th>
                  <th className={styles.narrowColumn}>Tick Date</th>
                  <th className={styles.narrowColumn}>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentBigTicks.map(tick => (
                  <tr key={tick.id}>
                    <td className={styles.wideColumn}>
                      <Link href={`/profile/${tick.user_id}`}>
                        <span className={styles.link}>{tick.username}</span>
                      </Link>
                    </td>
                    <td className={styles.wideColumn}>
                      <Link href={`/node/${tick.climb_id}`}>
                        <span className={styles.link}>{tick.name}</span>
                      </Link>
                    </td>
                    <td className={styles.narrowColumn}>{tick.grade || 'N/A'}</td>
                    <td className={styles.narrowColumn}>{tick.date}</td>
                    <td className={styles.narrowColumn}>{tick.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default withAuth(Home);
