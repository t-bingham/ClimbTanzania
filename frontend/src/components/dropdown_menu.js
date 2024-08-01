import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/dropdown_menu.module.css';

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      <button className={styles.dropbtn} onClick={toggleMenu}>
        Indexes {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <div className={styles.dropdownContent}>
          <Link href="/climbs" legacyBehavior>
            <a onClick={closeMenu}>Climbs Index</a>
          </Link>
          <Link href="/boulder_index" legacyBehavior>
            <a onClick={closeMenu}>Boulder Index</a>
          </Link>
          <Link href="/sport_index" legacyBehavior>
            <a onClick={closeMenu}>Sport Index</a>
          </Link>
          <Link href="/trad_index" legacyBehavior>
            <a onClick={closeMenu}>Trad Index</a>
          </Link>
          <Link href="/boulder_map" legacyBehavior>
            <a onClick={closeMenu}>Boulder Map</a>
          </Link>
          <Link href="/sport_map" legacyBehavior>
            <a onClick={closeMenu}>Sport Map</a>
          </Link>
          <Link href="/trad_map" legacyBehavior>
            <a onClick={closeMenu}>Trad Map</a>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
