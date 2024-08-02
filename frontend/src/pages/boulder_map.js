import React, { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import GradeFilter from '../components/grade_filter';
import climbsStyles from '../styles/climbs.module.css';

const LeafletMap = dynamic(() => import('../components/multi_pins_map'), { ssr: false });

const BoulderMap = ({ initialClimbs, initialSelectedGrades }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);

  const applyFilters = async (selectedGrades) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          type: 'Boulder',
          grades: selectedGrades.join(',')
        }
      });
      setClimbs(response.data);
      setSelectedGrades(selectedGrades); // Update selected grades
    } catch (error) {
      console.error('Error fetching filtered climbs:', error);
    }
  };

  const pins = climbs?.map(climb => ({
    position: [climb.latitude, climb.longitude],
    name: climb.name,
    grade: climb.grade,
    id: climb.id,
  })) || [];

  return (
    <div className={climbsStyles.container}>
      <div className={climbsStyles.content}>
        <h1 className={climbsStyles.title}>Boulder Map</h1>
        <GradeFilter
          onApply={applyFilters}
          initialSelectedGrades={selectedGrades} // Pass the selected grades to the filter component
          grades={[
            'V0-', 'V0', 'V0+', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
          ]}
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
        type: 'Boulder'
      }
    });
    return {
      props: {
        initialClimbs: response.data,
        initialSelectedGrades: [] // Set initial selected grades to empty
      },
    };
  } catch (error) {
    console.error('Error fetching boulder climbs:', error);
    return {
      props: {
        initialClimbs: [],
        initialSelectedGrades: [] // Set initial selected grades to empty
      },
    };
  }
}

export default BoulderMap;
