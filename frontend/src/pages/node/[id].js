import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../../components/leaflet_map'), { ssr: false });

const ClimbDetail = ({ climb }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const {
    id, // Add id here to use in the addClimbToTicklist function
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

  const addClimbToTicklist = async (climbId) => {
    try {
        const token = localStorage.getItem('token'); // Retrieve the token from storage
        const response = await axios.post(
            'http://localhost:8000/ticklist/add',
            { climb_id: climbId }, // Pass climb_id as a key-value pair
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the header
                    'Content-Type': 'application/json', // Ensure JSON content type
                }
            }
        );
        console.log('Climb added to ticklist:', response.data);
    } catch (error) {
        console.error('Error adding climb to ticklist:', error);
    }
};

  return (
    <div style={styles.container}>
      <main style={styles.content}>
        <h1 style={styles.title}>{name}</h1>
        <h2 style={styles.area}>{area}</h2>
        <p style={styles.grade}>Grade: {grade}{stars}</p>
        <p style={styles.firstAscensionist}>First Ascensionist: {first_ascensionist}</p>
        <p style={styles.firstAscentDate}>First Ascent Date: {new Date(first_ascent_date).toLocaleDateString('en-GB')}</p>
        <p style={styles.description}>{description || '\n'}</p>

        {/* Add the button to add to ticklist here */}
        <button onClick={() => addClimbToTicklist(id)} style={styles.button}>Tick</button>

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
