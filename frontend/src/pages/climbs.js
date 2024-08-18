import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import MapFilters from '../components/climb_index_filters';
import styles from '../styles/climbs.module.css';
import withAuth from '../hoc/withAuth';
import * as wellknown from 'wellknown';

const Climbs = ({ initialClimbs, initialPage }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [page, setPage] = useState(initialPage);
  const [areas, setAreas] = useState([]);
  const [hitlistClimbs, setHitlistClimbs] = useState([]);
  const [users, setUsers] = useState({});
  const [hasMore, setHasMore] = useState(initialClimbs.length === 25);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get('http://localhost:8000/areas/');
        const parsedAreas = response.data
          .filter(area => area.polygon)
          .map(area => {
            const parsed = wellknown.parse(area.polygon);
            const invertedCoordinates = parsed.coordinates[0].map(coord => [coord[1], coord[0]]);
            return {
              ...area,
              path: invertedCoordinates,
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
        setHitlistClimbs(response.data.map(climb => climb.id));
      } catch (error) {
        console.error('Error fetching hitlist:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users/');
        const usersData = response.data.reduce((acc, user) => {
          acc[user.username] = user.id;
          return acc;
        }, {});
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchAreas();
    fetchHitlist();
    fetchUsers();
  }, []);

  const applyFilters = async (selectedGrades, selectedAreas) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          grades: selectedGrades.join(','),
          areas: selectedAreas.join(','),
          skip: 0,
          limit: 25,
        }
      });
      setClimbs(response.data);
      setPage(1);
      setHasMore(response.data.length === 25);
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

  const loadPage = async (newPage) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          skip: (newPage - 1) * 25,
          limit: 25,
        }
      });
      setClimbs(response.data);
      setPage(newPage);
      setHasMore(response.data.length === 25);
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Climb Index</h1>
        <MapFilters
          grades={[
            'V0-', 'V0', 'V0+', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17',
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
          ]}
          areas={[...areas, { name: 'Independent Climbs', id: 'independent', path: [], color: 'red' }]}
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
                <th className={styles.narrowColumn}>Type</th>
                <th className={styles.narrowColumn}>Hitlist</th>
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
                  <td className={styles.wideColumn}>
                    {users[climb.first_ascensionist] ? (
                      <Link href={`/profile/${users[climb.first_ascensionist]}`} legacyBehavior>
                        <a className={styles.link}>{climb.first_ascensionist}</a>
                      </Link>
                    ) : (
                      climb.first_ascensionist || 'N/A'
                    )}
                  </td>
                  <td className={styles.narrowColumn}>
                    {climb.first_ascent_date ? new Date(climb.first_ascent_date).getFullYear() : 'N/A'}
                  </td>
                  <td className={styles.wideColumn}>{climb.type || 'N/A'}</td>
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
        <div className={styles.pagination}>
        {page > 1 && (
          <button
            onClick={() => loadPage(page - 1)}
            style={{ ...styles.paginationButton, marginRight: '10px' }}  // Add margin-right to the previous button
          >
            Previous Page
          </button>
        )}
        {hasMore && (
          <button
            onClick={() => loadPage(page + 1)}
            style={styles.paginationButton}
          >
            Next Page
          </button>
        )}
      </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:8000/climbs/', {
      params: {
        skip: 0,
        limit: 25,
      }
    });
    return {
      props: {
        initialClimbs: response.data,
        initialPage: 1,
      },
    };
  } catch (error) {
    console.error('Error fetching climbs:', error);
    return {
      props: {
        initialClimbs: [],
        initialPage: 1,
      },
    };
  }
}

export default withAuth(Climbs);
