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

  const handleUpdatePinCoordinates = (newCoordinates) => {
    setPinCoordinates(newCoordinates);
    setCanDropPin(false); // Optional: disable pin dropping after confirming coordinates
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={styles.title}>Add a Climb</h1>
        <ClimbForm 
          pinCoordinates={pinCoordinates} 
          updatePinCoordinates={handleUpdatePinCoordinates} 
        />
        <div style={{ width: '100%', position: 'relative', height: '500px' }}>
          <LeafletMap 
            canDropPin={canDropPin} 
            togglePinDropping={togglePinDropping} 
            setPinCoordinates={setPinCoordinates} 
            externalPosition={pinCoordinates} 
          />
        </div>
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
};

export default withAuth(AddClimb);
