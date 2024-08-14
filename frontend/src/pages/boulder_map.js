import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import MapFilters from '../components/map_filters';
import climbsStyles from '../styles/climbs.module.css';
import * as wellknown from 'wellknown';

const LeafletMap = dynamic(() => import('../components/multi_pins_map'), { ssr: false });

const BoulderMap = ({ initialClimbs, initialSelectedGrades, initialSelectedAreas }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);
  const [selectedAreas, setSelectedAreas] = useState(initialSelectedAreas);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const response = await axios.get('http://localhost:8000/areas/');
        console.log('Raw areas data:', response.data);  // Log the raw response

        const parsedPolygons = response.data
          .filter(polygon => polygon.polygon)
          .map(polygon => {
            const parsed = wellknown.parse(polygon.polygon);
            console.log('Parsed polygon:', parsed);  // Log the parsed polygon

            const invertedCoordinates = parsed.coordinates[0].map(coord => [coord[1], coord[0]]); // Invert lat/lng

            return {
              ...polygon,
              path: invertedCoordinates,  // Use inverted coordinates
              color: 'black',
            };
          });

        console.log('Parsed polygons:', parsedPolygons);  // Log the final parsed polygons
        setPolygons(parsedPolygons);
      } catch (error) {
        console.error('Error fetching polygons:', error);
      }
    };
    fetchPolygons();
  }, []);

  const applyFilters = async (selectedGrades, selectedAreas) => {
    try {
      const response = await axios.get('http://localhost:8000/climbs/', {
        params: {
          type: 'Boulder',
          grades: selectedGrades.join(','),
          areas: selectedAreas.join(','),
        }
      });
      setClimbs(response.data);
      setSelectedGrades(selectedGrades);
      setSelectedAreas(selectedAreas);
    } catch (error) {
      console.error('Error fetching filtered climbs:', error);
    }
  };

  // Filter polygons based on selected areas
  const filteredPolygons = polygons.filter(polygon => selectedAreas.includes(polygon.name));

  const pins = climbs?.map(climb => ({
    position: [climb.latitude, climb.longitude],
    name: climb.name,
    grade: climb.grade,
    id: climb.id,
    area: climb.area,
  })) || [];

  return (
    <div className={climbsStyles.container}>
      <div className={climbsStyles.content}>
        <h1 className={climbsStyles.title}>Boulder Map</h1>
        <MapFilters
          onApply={applyFilters}
          initialSelectedGrades={selectedGrades}
          initialSelectedAreas={selectedAreas}
          grades={[
            'V0-', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
          ]}
          areas={polygons}
        />
        <LeafletMap pins={pins} polygons={filteredPolygons} />
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
        initialSelectedGrades: [],
        initialSelectedAreas: [],  // Initialize with no areas selected
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

export default BoulderMap;
