import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import MapFilters from '../components/map_filters';
import climbsStyles from '../styles/climbs.module.css';
import * as wellknown from 'wellknown';
import withAuth from '../hoc/withAuth';

const LeafletMap = dynamic(() => import('../components/multi_pins_map'), { ssr: false });

const TradMap = ({ initialClimbs, initialSelectedGrades, initialSelectedAreas }) => {
  const [climbs, setClimbs] = useState(initialClimbs);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);
  const [selectedAreas, setSelectedAreas] = useState(initialSelectedAreas);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const response = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/areas/');
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
      const areasToQuery = selectedAreas.includes("Independent") ? [...selectedAreas] : selectedAreas;

      const response = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/climbs/', {
        params: {
          type: 'Trad',
          grades: selectedGrades.join(','),
          areas: areasToQuery.join(','),  // Pass selected areas to backend
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
        <h1 className={climbsStyles.title}>Trad Map</h1>
        <MapFilters
          onApply={applyFilters}
          initialSelectedGrades={selectedGrades}
          initialSelectedAreas={selectedAreas}
          grades={[
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
          ]}
          areas={[...polygons, { name: 'Independent Climbs', id: 'independent', path: [], color: 'red' }]} // Add "Uncontained Climbs" as an option
        />
        <LeafletMap pins={pins} polygons={filteredPolygons} />
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const response = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/climbs/', {
      params: {
        type: 'Trad'
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

export default withAuth(TradMap);
