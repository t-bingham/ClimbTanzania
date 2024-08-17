import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../../components/leaflet_map'), { ssr: false });

const ClimbDetail = ({ climb }) => {
  const router = useRouter();
  const [isOnTicklist, setIsOnTicklist] = useState(false);
  const [isOnHitlist, setIsOnHitlist] = useState(false);
  const [logs, setLogs] = useState([]); // State to store logs

  const {
    id,
    name,
    area,
    grade,
    quality,
    first_ascensionist,
    first_ascent_date,
    description,
    latitude,
    longitude
  } = climb;

  const stars = '★'.repeat(quality);

  useEffect(() => {
    const checkLists = async () => {
      try {
        const token = localStorage.getItem('token');

        // Check Ticklist
        const ticklistResponse = await axios.get('http://localhost:8000/ticklist/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const ticklist = ticklistResponse.data;
        setIsOnTicklist(ticklist.some(item => item.id === climb.id));

        // Check Hitlist
        const hitlistResponse = await axios.get('http://localhost:8000/hitlist/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const hitlist = hitlistResponse.data;
        setIsOnHitlist(hitlist.some(item => item.id === climb.id));

        // Fetch logs for the climb
        const logsResponse = await axios.get(`http://localhost:8000/climbs/${id}/logs`);
        setLogs(logsResponse.data);
      } catch (error) {
        console.error('Error checking lists or fetching logs:', error);
      }
    };

    checkLists();
  }, [climb.id]);

  const toggleTicklist = async () => {
    try {
      const token = localStorage.getItem('token');
      const isRemoving = isOnTicklist;
      const url = `http://localhost:8000/ticklist/${isRemoving ? 'remove' : 'add'}`;
  
      const response = await axios.post(
        url,
        { climb_id: climb.id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (!isRemoving) {
        // If the climb is being added to the ticklist, redirect to the logging page
        router.push(`/log/${climb.id}`);
      } else {
        // If the climb is being removed from the ticklist, remove the associated log
        const logResponse = await axios.post(
          'http://localhost:8000/logs/remove',
          { climb_id: climb.id },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
  
        console.log('Log removed:', logResponse.data);
  
        // Update the state to reflect that the climb has been removed from the ticklist
        setIsOnTicklist(false);
        // Also remove the log from the displayed logs
        setLogs(logs.filter(log => log.climb_id !== climb.id));
      }
  
      console.log(`Climb ${isRemoving ? 'removed from' : 'added to'} ticklist:`, response.data);
    } catch (error) {
      console.error(`Error ${isOnTicklist ? 'removing' : 'adding'} climb from/to ticklist:`, error);
    }
  };

  const toggleHitlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:8000/hitlist/${isOnHitlist ? 'remove' : 'add'}`;
      const response = await axios.post(
        url,
        { climb_id: climb.id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setIsOnHitlist(!isOnHitlist);
      console.log(`Climb ${isOnHitlist ? 'removed from' : 'added to'} hitlist:`, response.data);
    } catch (error) {
      console.error(`Error ${isOnHitlist ? 'removing' : 'adding'} climb from/to hitlist:`, error);
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <main style={styles.content}>
        <h1 style={styles.title}>{name}</h1>
        <h2 style={styles.area}>{area}</h2>
        <p style={styles.grade}>Grade: {grade}{stars}</p>
        <p style={styles.firstAscensionist}>First Ascensionist: {first_ascensionist}</p>
        <p style={styles.firstAscentDate}>First Ascent Date: {new Date(first_ascent_date).toLocaleDateString('en-GB')}</p>
        <p style={styles.description}>{description || '\n'}</p>

        <div style={styles.buttonContainer}>
          <button onClick={toggleTicklist} style={styles.button}>
            {isOnTicklist ? 'Untick' : 'Tick'}
          </button>
          <button onClick={toggleHitlist} style={styles.button}>
            {isOnHitlist ? 'Unhit' : 'Hit'}
          </button>
        </div>

        <div style={styles.mapContainer}>
          <LeafletMap initialPosition={{ lat: latitude, lng: longitude }} isEditable={false} />
        </div>

        <div style={styles.logsContainer}>
          <h2 style={styles.logsTitle}>User Logs</h2>
          {logs.length > 0 ? (
            <table style={styles.logsTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Grade</th>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Comment</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td style={styles.tableCell}>{log.username}</td>
                    <td style={styles.tableCell}>{log.grade}</td>
                    <td style={styles.tableCell}>{new Date(log.date).toLocaleDateString('en-GB')}</td>
                    <td style={styles.tableCell}>{log.comment || 'No comment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.noLogsMessage}>No logs, be the first to send and submit!</p>
          )}
        </div>
      </main>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const response = await axios.get(`http://localhost:8000/climbs/${id}`);
    return {
      props: {
        climb: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching climb:', error.response ? error.response.data : error.message);
    return {
      notFound: true,
    };
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    paddingBottom: '60px', // Ensure there's space for the footer
    maxWidth: '75vw', // Ensure content doesn't exceed 75% of the screen width
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center', // Center the text
  },
  area: {
    fontSize: '2rem',
    marginBottom: '10px',
    textAlign: 'center', // Center the text
  },
  grade: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    textAlign: 'center', // Center the text
  },
  firstAscensionist: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center', // Center the text
  },
  firstAscentDate: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center', // Center the text
  },
  description: {
    fontSize: '1.2rem',
    marginBottom: '20px',
    textAlign: 'justify',
    whiteSpace: 'pre-wrap', // Ensure new lines are displayed
  },
  mapContainer: {
    width: '75vw', // Set the width to 75% of the viewport width
    height: '400px',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '100px', // Ensure the map doesn't overlap with the footer
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '50%', // Adjust this as needed
    marginTop: '20px',
    marginBottom: '40px',
  },
  button: {
    backgroundColor: '#050505',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    flex: 1, // Make buttons share available space
    marginLeft: '10px',
    marginRight: '10px',
  },
  logsContainer: {
    marginTop: '40px',
    width: '100%',
    maxWidth: '75vw',
  },
  logsTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  logsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: '1px solid #ddd',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
  },
  tableCell: {
    borderBottom: '1px solid #ddd',
    padding: '10px',
    textAlign: 'left',
  },
  noLogsMessage: {
    textAlign: 'center',
    fontSize: '1.2rem',
    marginTop: '20px',
  },
};

export default ClimbDetail;
