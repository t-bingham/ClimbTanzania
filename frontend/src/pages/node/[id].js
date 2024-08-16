import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../../components/leaflet_map'), { ssr: false });

const ClimbDetail = ({ climb }) => {
  const router = useRouter();
  const [isOnTicklist, setIsOnTicklist] = useState(false); // State to track if climb is on ticklist

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
    // Check if the climb is on the ticklist when the component mounts
    const checkIfOnTicklist = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/ticklist/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const ticklist = response.data;
        setIsOnTicklist(ticklist.some(item => item.id === climb.id));
      } catch (error) {
        console.error('Error checking ticklist:', error);
      }
    };

    checkIfOnTicklist();
  }, [climb.id]);

  const toggleTicklist = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:8000/ticklist/${isOnTicklist ? 'remove' : 'add'}`;
      const response = await axios.post(
        url,
        { climb_id: climb.id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setIsOnTicklist(!isOnTicklist); // Toggle the state after successful add/remove
      console.log(`Climb ${isOnTicklist ? 'removed from' : 'added to'} ticklist:`, response.data);
    } catch (error) {
      console.error(`Error ${isOnTicklist ? 'removing' : 'adding'} climb from/to ticklist:`, error);
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

        {/* Conditionally render the button based on ticklist status */}
        <button onClick={toggleTicklist} style={styles.button}>
          {isOnTicklist ? 'Remove from Ticklist' : 'Add to Ticklist'}
        </button>

        <div style={styles.mapContainer}>
          <LeafletMap initialPosition={{ lat: latitude, lng: longitude }} isEditable={false} />
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
  button: {
    backgroundColor: '#050505',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
    marginBottom: '40px',
  },
};

export default ClimbDetail;
