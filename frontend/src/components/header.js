import { useEffect, useState } from 'react';
import Link from 'next/link';
import DropdownMenu from './dropdown_menu'; 
import { useRouter } from 'next/router';
import { FaBars } from 'react-icons/fa';

const Header = () => {
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    // Add the favicon to the document head
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/favicon.png'; // Adjust this path if needed
    document.head.appendChild(link);

    // Clean up the effect if the header is ever unmounted
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const climbsOptions = [
    { href: '/climbs', label: 'Climbs Index' },
    { href: '/boulder_index', label: 'Boulder Index' },
    { href: '/sport_index', label: 'Sport Index' },
    { href: '/trad_index', label: 'Trad Index' },
    { href: '/boulder_map', label: 'Boulder Map' },
    { href: '/sport_map', label: 'Sport Map' },
    { href: '/trad_map', label: 'Trad Map' },
  ];

  const profileOptions = [
    { href: userId ? `/profile/${userId}` : '#', label: 'Profile' },
    { href: '/hitlist', label: 'Hitlist' }, 
    { href: '/add_climb', label: 'Add a Climb' }, 
    { href: '/add_area', label: 'Add an Area' }, 
    { label: 'Logout', onClick: handleLogout },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.leftContainer}>
        <Link href="/">
          <img src="/logo.png" alt="Logo" style={styles.logo} />
        </Link>
        <nav style={styles.nav}>
          <DropdownMenu label="Climbs" options={climbsOptions} />
        </nav>
      </div>
      <div style={styles.rightContainer}>
        <DropdownMenu label={<FaBars />} options={profileOptions} isBurgerMenu={true} />
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
    padding: '10px 0',
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '15px',
  },
  logo: {
    height: '50px',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    marginLeft: '20px',
  },
  rightContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

export default Header;
