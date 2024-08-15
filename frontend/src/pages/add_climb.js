import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ClimbForm from '../components/climb_form';
import withAuth from '../hoc/withAuth';

const LeafletMap = dynamic(() => import('../components/leaflet_map'), { ssr: false });

const AddClimb = () => {
  const [isClient, setIsClient] = useState(false);
  const [canDropPin, setCanDropPin] = useState(false);
  const [pinCoordinates, setPinCoordinates] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const togglePinDropping = () => {
    setCanDropPin(!canDropPin);
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={styles.title}>Add a Climb</h1>
        <div style={styles.buttonContainer}>
          <button onClick={togglePinDropping} style={styles.button}>
            {canDropPin ? 'Start Dropping Pins' : 'Drop a pin, a form will appear to fill out the details of your climb! After you drop, you can drag the pin around the map to get it just right.'}
          </button>
        </div>
        <div style={{ width: '100%', position: 'relative', height: '500px' }}>
          <LeafletMap canDropPin={canDropPin} togglePinDropping={togglePinDropping} setPinCoordinates={setPinCoordinates} />
        </div>
        {pinCoordinates && <ClimbForm pinCoordinates={pinCoordinates} />}
      </div>
    </div>
  );
};

const styles = {
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '32px',
    paddingBottom: '10px',
  },
  buttonContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
  },
};

export default withAuth(AddClimb);
