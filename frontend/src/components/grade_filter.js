import React, { useState } from 'react';
import styles from '../styles/grade_filter.module.css';

const GradeFilter = ({ onApply }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState([]);

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

  const renderGradeCheckboxes = (title, gradeList) => (
    <div className={styles.filterSection}>
      <h3>{title}</h3>
      <div className={styles.checkboxGroup}>
        {gradeList.map(grade => (
          <div key={grade} className={styles.checkboxContainer}>
            <input
              type="checkbox"
              value={grade}
              onChange={handleGradeChange}
              className={styles.checkbox}
            />
            <label className={styles.checkboxLabel}>{grade}</label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <button onClick={toggleFilter} className={styles.filterButton}>
        {filterOpen ? 'Close Filters' : 'Open Filters'}
      </button>
      {filterOpen && (
        <div className={styles.filterContainer}>
          {renderGradeCheckboxes('Boulder', [
            'V0-', 'V0', 'V0+', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
          ])}
          <br />
          {renderGradeCheckboxes('Sport', [
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
          ])}
          <br />
          {renderGradeCheckboxes('Trad', [
            '4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
          ])}
          <button onClick={applyFilters} className={styles.applyButton}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default GradeFilter;
