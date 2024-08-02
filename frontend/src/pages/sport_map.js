import React, { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import GradeFilter from '../components/grade_filter';
import climbsStyles from '../styles/climbs.module.css';

const LeafletMap = dynamic(() => import('../components/multi_pins_map'), { ssr: false });

const SportMap = ({ initialClimbs, initialSelectedGrades }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);

  const applyFilters = async (selectedGrades) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          type: 'Sport',
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
        <h1 className={climbsStyles.title}>Sport Map</h1>
        <GradeFilter
          onApply={applyFilters}
          initialSelectedGrades={selectedGrades} // Pass the selected grades to the filter component
          grades={[
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
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
        type: 'Sport'
      }
    });
    return {
      props: {
        initialClimbs: response.data,
        initialSelectedGrades: [] // Set initial selected grades to empty
      },
    };
  } catch (error) {
    console.error('Error fetching sport climbs:', error);
    return {
      props: {
        initialClimbs: [],
        initialSelectedGrades: [] // Set initial selected grades to empty
      },
    };
  }
}

export default SportMap;
