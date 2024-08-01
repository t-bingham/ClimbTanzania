import React from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../components/multi_pins_map'), { ssr: false });

const TradMap = ({ climbs }) => {
  const pins = climbs.map(climb => ({
    position: [climb.latitude, climb.longitude],
    name: climb.name,
    grade: climb.grade,
    id: climb.id,
  }));

  return (
    <div style={styles.container}>
      <main style={styles.content}>
        <h1 style={styles.title}>Trad Map</h1>
        <LeafletMap pins={pins} />
      </main>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:8000/climbs?type=Trad');
    return {
      props: {
        climbs: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching trad climbs:', error);
    return {
      props: {
        climbs: [],
      },
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
    maxWidth: '75%',
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
};

export default TradMap;
