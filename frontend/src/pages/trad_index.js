import React from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/index_layout.module.css'; // Ensure this is the correct path

const TradIndex = ({ trads }) => {
  console.log('Trads data:', trads);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Trad Index</h1>
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
            {trads.map(trad => (
              <tr key={trad.id}>
                <td className={styles.wideColumn}>
                  <Link href={`/node/${trad.id}`} legacyBehavior>
                    <a className={styles.link}>{trad.name}</a>
                  </Link>
                </td>
                <td className={styles.narrowColumn}>{trad.grade || 'N/A'}</td>
                <td className={styles.wideColumn}>{trad.area || 'N/A'}</td>
                <td className={styles.wideColumn}>{trad.first_ascensionist || 'N/A'}</td>
                <td className={styles.narrowColumn}>
                  {trad.first_ascent_date ? new Date(trad.first_ascent_date).getFullYear() : 'N/A'}
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
    const trads = response.data.filter(climb => climb.type === 'Trad');
    console.log('Fetched trads:', trads);
    return {
      props: {
        trads,
      },
    };
  } catch (error) {
    console.error('Error fetching trads:', error);
    return {
      props: {
        trads: [],
      },
    };
  }
}

export default TradIndex;
