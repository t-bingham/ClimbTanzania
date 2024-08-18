import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import MapFilters from '../components/map_filters';
import styles from '../styles/climbs.module.css';
import withAuth from '../hoc/withAuth';
import * as wellknown from 'wellknown';

const BoulderIndex = ({ initialClimbs }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [areas, setAreas] = useState([]);
  const [hitlistClimbs, setHitlistClimbs] = useState([]); // State to store hitlist climbs

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get('http://localhost:8000/areas/');
        const parsedAreas = response.data
          .filter(area => area.polygon)
          .map(area => {
            const parsed = wellknown.parse(area.polygon);
            const invertedCoordinates = parsed.coordinates[0].map(coord => [coord[1], coord[0]]); // Invert lat/lng
            return {
              ...area,
              path: invertedCoordinates, // Use inverted coordinates
            };
          });
        setAreas(parsedAreas);
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    const fetchHitlist = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/hitlist/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHitlistClimbs(response.data.map(climb => climb.id)); // Store hitlist climb IDs
      } catch (error) {
        console.error('Error fetching hitlist:', error);
      }
    };

    fetchAreas();
    fetchHitlist();
  }, []);

  const applyFilters = async (selectedGrades, selectedAreas) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          type: 'Boulder',
          grades: selectedGrades.join(','),
          areas: selectedAreas.join(','),
        }
      });
      setClimbs(response.data);
    } catch (error) {
      console.error('Error fetching filtered climbs:', error);
    }
  };

  const toggleHitlist = async (climbId) => {
    try {
      const token = localStorage.getItem('token');
      const isOnHitlist = hitlistClimbs.includes(climbId);
      const url = `http://localhost:8000/hitlist/${isOnHitlist ? 'remove' : 'add'}`;

      await axios.post(
        url,
        { climb_id: climbId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setHitlistClimbs(prev =>
        isOnHitlist ? prev.filter(id => id !== climbId) : [...prev, climbId]
      );
    } catch (error) {
      console.error(`Error ${hitlistClimbs.includes(climbId) ? 'removing' : 'adding'} climb from/to hitlist:`, error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Boulder Index</h1>
        <MapFilters
          grades={[
            'V0-', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
          ]}
          areas={[...areas, { name: 'Independent Climbs', id: 'independent', path: [], color: 'red' }]}  // Pass areas
          onApply={applyFilters}
        />
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.wideColumn}>Name</th>
                <th className={styles.narrowColumn}>Grade</th>
                <th className={styles.wideColumn}>Area</th>
                <th className={styles.wideColumn}>First Ascensionist</th>
                <th className={styles.narrowColumn}>First Ascent Year</th>
                <th className={styles.narrowColumn}>Hitlist</th> {/* New column for hitlist button */}
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
                  <td className={styles.narrowColumn}>
                    <button
                      onClick={() => toggleHitlist(climb.id)}
                      style={styles.hitButton}
                    >
                      {hitlistClimbs.includes(climb.id) ? 'Remove' : 'Add'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:8000/climbs/', {
      params: {
        type: 'Boulder'
      }
    });
    console.log(response.data);
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

export default withAuth(BoulderIndex);
