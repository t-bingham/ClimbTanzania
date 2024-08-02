import React, { useState, useEffect } from 'react';
import styles from '../styles/grade_filter.module.css';

const GradeFilter = ({ onApply, initialSelectedGrades = [], grades }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState(initialSelectedGrades);

  useEffect(() => {
    setSelectedGrades(initialSelectedGrades);
  }, [initialSelectedGrades]);

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleGradeChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedGrades([...selectedGrades, value]);
    } else {
      setSelectedGrades(selectedGrades.filter(grade => grade !== value));
    }
  };

  const applyFilters = () => {
    onApply(selectedGrades);
  };

  return (
    <div>
      <button onClick={toggleFilter} className={styles.filterButton}>
        {filterOpen ? 'Close Filters' : 'Open Filters'}
      </button>
      {filterOpen && (
        <div className={styles.filterContainer}>
          <div className={styles.filterSection}>
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
          <button onClick={applyFilters} className={styles.applyButton}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default GradeFilter;
