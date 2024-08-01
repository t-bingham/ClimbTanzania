import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/dropdown_menu.module.css'; // Ensure the path is correct

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      <button onClick={toggleDropdown} className={styles.dropbtn}>
        Indexes &#x25BC;
      </button>
      {isOpen && (
        <div className={styles.dropdownContent}>
          <Link href="/climbs" legacyBehavior>
            <a onClick={closeDropdown}>Climbs Index</a>
          </Link>
          <Link href="/boulder_index" legacyBehavior>
            <a onClick={closeDropdown}>Boulder Index</a>
          </Link>
          <Link href="/sport_index" legacyBehavior>
            <a onClick={closeDropdown}>Sport Index</a>
          </Link>
          <Link href="/trad_index" legacyBehavior>
            <a onClick={closeDropdown}>Trad Index</a>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
