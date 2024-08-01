import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import GradeFilter from '../components/grade_filter';
import styles from '../styles/climbs.module.css';

const SportIndex = ({ initialClimbs }) => {
  const [climbs, setClimbs] = useState(initialClimbs);

  const applyFilters = async (selectedGrades) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          type: 'Sport',
          grades: selectedGrades.join(',')
        }
      });
      setClimbs(response.data);
    } catch (error) {
      console.error('Error fetching filtered climbs:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Sport Index</h1>
        <GradeFilter
          grades={[
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
          ]}
          onApply={applyFilters}
        />
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
            {climbs.map(climb => (
              <tr key={climb.id}>
                <td className={styles.wideColumn}>
                  <Link href={`/node/${climb.id}`} legacyBehavior>
                    <a className={styles.link}>{climb.name}</a>
                  </Link>
                </td>
                <td className={styles.narrowColumn}>{climb.grade || 'N/A'}</td>
                <td className={styles.wideColumn}>{climb.area || 'N/A'}</td>
                <td className={styles.wideColumn}>{climb.first_ascensionist || 'N/A'}</td>
                <td className={styles.narrowColumn}>
                  {climb.first_ascent_date ? new Date(climb.first_ascent_date).getFullYear() : 'N/A'}
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
    const response = await axios.get('http://localhost:8000/climbs/', {
      params: { type: 'Sport' }
    });
    return {
      props: {
        initialClimbs: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching climbs:', error);
    return {
      props: {
        initialClimbs: [],
      },
    };
  }
}

export default SportIndex;
