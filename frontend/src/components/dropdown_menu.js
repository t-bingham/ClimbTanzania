import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/dropdown_menu.module.css';

const DropdownMenu = ({ label, options, isBurgerMenu }) => {
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

  const dropdownClass = isBurgerMenu ? styles.burgerDropdown : styles.dropdown;
  const dropbtnClass = isBurgerMenu ? styles.burgerDropbtnNoArrow : styles.dropbtn; // Use the no-arrow class for the burger menu
  const dropdownContentClass = isBurgerMenu ? styles.burgerDropdownContent : styles.dropdownContent;

  return (
    <div className={dropdownClass} ref={dropdownRef}>
      <button className={dropbtnClass} onClick={toggleMenu}>
        {label} {!isBurgerMenu && (isOpen ? '▲' : '▼')} {/* Only add the arrow for non-burger menus */}
      </button>
      {isOpen && (
        <div className={dropdownContentClass}>
          {options.map((option, index) => (
            option.href ? (
              <Link href={option.href} key={index} legacyBehavior>
                <a onClick={closeMenu}>{option.label}</a>
              </Link>
            ) : (
              <button key={index} onClick={() => { option.onClick(); closeMenu(); }}>
                {option.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
