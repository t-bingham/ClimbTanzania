import Link from 'next/link';
import DropdownMenu from './dropdown_menu'; // Ensure this is the correct path to your dropdown_menu component

const Header = () => {
  const indexOptions = [
    { href: '/climbs', label: 'Climbs Index' },
    { href: '/boulder_index', label: 'Boulder Index' },
    { href: '/sport_index', label: 'Sport Index' },
    { href: '/trad_index', label: 'Trad Index' },
  ];

  const mapOptions = [
    { href: '/boulder_map', label: 'Boulder Map' },
    { href: '/sport_map', label: 'Sport Map' },
    { href: '/trad_map', label: 'Trad Map' },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <Link href="/">
          <img src="/logo.png" alt="Logo" style={styles.logo} />
        </Link>
        <nav style={styles.nav}>
          <DropdownMenu label="Indexes" options={indexOptions} />
          <DropdownMenu label="Maps" options={mapOptions} />
        </nav>
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
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '15px',
  },
  logo: {
    height: '50px',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: '30px', // Add padding to the left of the dropdown menu
  },
};

export default Header;
