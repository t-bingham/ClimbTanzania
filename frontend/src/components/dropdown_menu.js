import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/dropdown_menu.module.css';

const DropdownMenu = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      closeMenu();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button className={styles.dropbtn} onClick={toggleMenu}>
        {label} {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <div className={styles.dropdownContent}>
          {options.map((option, index) => (
            <Link href={option.href} key={index} legacyBehavior>
              <a onClick={closeMenu}>{option.label}</a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
