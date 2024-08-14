import React, { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import MapFilters from '../components/map_filters';
import climbsStyles from '../styles/climbs.module.css';

const LeafletMap = dynamic(() => import('../components/multi_pins_map'), { ssr: false });

const SportMap = ({ initialClimbs, initialSelectedGrades, initialSelectedAreas }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);
  const [selectedAreas, setSelectedAreas] = useState(initialSelectedAreas);

  const applyFilters = async (selectedGrades, selectedAreas) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          type: 'Sport',
          grades: selectedGrades.join(','),
          areas: selectedAreas.join(','),
          include_undefined_areas: selectedAreas.includes('Undefined Areas'),
        }
      });
      setClimbs(response.data);
      setSelectedGrades(selectedGrades);
      setSelectedAreas(selectedAreas);
    } catch (error) {
      console.error('Error fetching filtered climbs:', error);
    }
  };

  const pins = climbs?.map(climb => ({
    position: [climb.latitude, climb.longitude],
    name: climb.name,
    grade: climb.grade,
    id: climb.id,
    area: climb.area || 'Undefined Area',
  })) || [];

  return (
    <div className={climbsStyles.container}>
      <div className={climbsStyles.content}>
        <h1 className={climbsStyles.title}>Sport Map</h1>
        <MapFilters
          onApply={applyFilters}
          initialSelectedGrades={selectedGrades}
          initialSelectedAreas={selectedAreas}
          grades={[
            '5a', '5b', '5c', '6a', '6b', '6c', '7a', '7b', '7c', '8a', '8b', '8c', '9a'
          ]}
          areas={['Area1', 'Area2', 'Area3', 'Undefined Areas']}  // Example areas and the special "Undefined Areas"
        />
        <LeafletMap pins={pins} />
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:8000/climbs/', {
      params: {
        type: 'Sport'
      }
    });
    return {
      props: {
        initialClimbs: response.data,
        initialSelectedGrades: [],
        initialSelectedAreas: [],
      }
    };
  } catch (error) {
    console.error('Error fetching initial climbs:', error);
    return {
      props: {
        initialClimbs: [],
        initialSelectedGrades: [],
        initialSelectedAreas: [],
      }
    };
  }
}

export default SportMap;
