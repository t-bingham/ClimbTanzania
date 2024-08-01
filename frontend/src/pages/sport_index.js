import React from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/index_layout.module.css'; // Ensure this is the correct path

const SportIndex = ({ sports }) => {
  console.log('Sports data:', sports);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Sport Index</h1>
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
            {sports.map(sport => (
              <tr key={sport.id}>
                <td className={styles.wideColumn}>
                  <Link href={`/node/${sport.id}`} legacyBehavior>
                    <a className={styles.link}>{sport.name}</a>
                  </Link>
                </td>
                <td className={styles.narrowColumn}>{sport.grade || 'N/A'}</td>
                <td className={styles.wideColumn}>{sport.area || 'N/A'}</td>
                <td className={styles.wideColumn}>{sport.first_ascensionist || 'N/A'}</td>
                <td className={styles.narrowColumn}>
                  {sport.first_ascent_date ? new Date(sport.first_ascent_date).getFullYear() : 'N/A'}
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
    const sports = response.data.filter(climb => climb.type === 'Sport');
    console.log('Fetched sports:', sports);
    return {
      props: {
        sports,
      },
    };
  } catch (error) {
    console.error('Error fetching sports:', error);
    return {
      props: {
        sports: [],
      },
    };
  }
}

export default SportIndex;
