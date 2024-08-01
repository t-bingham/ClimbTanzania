import React from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/index_layout.module.css'; // Ensure this is the correct path

const BoulderIndex = ({ boulders }) => {
  console.log('Boulders data:', boulders);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Boulder Index</h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.wideColumn}>Name</th>
              <th className={styles.narrowColumn}>Grade</th>
              <th className={styles.wideColumn}>Area</th>
              <th className={styles.wideColumn}>First Ascensionist</th>
              <th className={styles.narrowColumn}>First Ascent Year</th>
            </tr>
          </thead>
          <tbody>
            {boulders.map(boulder => (
              <tr key={boulder.id}>
                <td className={styles.wideColumn}>
                  <Link href={`/node/${boulder.id}`} legacyBehavior>
                    <a className={styles.link}>{boulder.name}</a>
                  </Link>
                </td>
                <td className={styles.narrowColumn}>{boulder.grade || 'N/A'}</td>
                <td className={styles.wideColumn}>{boulder.area || 'N/A'}</td>
                <td className={styles.wideColumn}>{boulder.first_ascensionist || 'N/A'}</td>
                <td className={styles.narrowColumn}>
                  {boulder.first_ascent_date ? new Date(boulder.first_ascent_date).getFullYear() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:8000/climbs/');
    const boulders = response.data.filter(climb => climb.type === 'Boulder');
    console.log('Fetched boulders:', boulders);
    return {
      props: {
        boulders,
      },
    };
  } catch (error) {
    console.error('Error fetching boulders:', error);
    return {
      props: {
        boulders: [],
      },
    };
  }
}

export default BoulderIndex;
