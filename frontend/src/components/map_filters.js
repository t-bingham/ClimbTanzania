import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/grade_filter.module.css';

const MapFilters = ({ onApply, initialSelectedGrades = [], initialSelectedAreas = [], grades, areas = [] }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);
  const [selectedAreas, setSelectedAreas] = useState(initialSelectedAreas);

  // Use refs to prevent unnecessary state updates
  const initialGradesSet = useRef(false);
  const initialAreasSet = useRef(false);

  useEffect(() => {
    if (!initialGradesSet.current) {
      setSelectedGrades(initialSelectedGrades);
      initialGradesSet.current = true;
    }
  }, [initialSelectedGrades]);

  useEffect(() => {
    if (!initialAreasSet.current) {
      setSelectedAreas(initialSelectedAreas);
      initialAreasSet.current = true;
    }
  }, [initialSelectedAreas]);

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleGradeChange = (event) => {
    const { value, checked } = event.target;
    setSelectedGrades(prevSelectedGrades =>
      checked ? [...prevSelectedGrades, value] : prevSelectedGrades.filter(grade => grade !== value)
    );
  };

  const handleAreaChange = (event) => {
    const { value, checked } = event.target;
    setSelectedAreas(prevSelectedAreas =>
      checked ? [...prevSelectedAreas, value] : prevSelectedAreas.filter(area => area !== value)
    );
  };

  const applyFilters = () => {
    onApply(selectedGrades, selectedAreas);
  };

  return (
    <div>
      <button onClick={toggleFilter} className={styles.filterButton}>
        {filterOpen ? 'Close Filters' : 'Open Filters'}
      </button>
      {filterOpen && (
        <div className={styles.filterContainer}>
          <div className={styles.filterSection}>
            <h3>Grades</h3>
            <div className={styles.checkboxGroup}>
              {grades.map(grade => (
                <div key={grade} className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    value={grade}
                    onChange={handleGradeChange}
                    checked={selectedGrades.includes(grade)}
                    className={styles.checkbox}
                  />
                  <label className={styles.checkboxLabel}>{grade}</label>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.filterSection}>
            <h3>Areas</h3>
            <div className={styles.checkboxGroup}>
              {areas.length > 0 ? (
                areas.map(area => (
                  <div key={area.id} className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      value={area.name}  // Use area.name as the checkbox value
                      onChange={handleAreaChange}
                      checked={selectedAreas.includes(area.name)}  // Check if area.name is selected
                      className={styles.checkbox}
                    />
                    <label className={styles.checkboxLabel}>{area.name}</label>
                  </div>
                ))
              ) : (
                <p>No areas available</p>
              )}
            </div>
          </div>
          <button onClick={applyFilters} className={styles.applyButton}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default MapFilters;
