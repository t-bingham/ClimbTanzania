import Link from 'next/link';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <Link href="/">
          <img src="/logo.png" alt="Logo" style={styles.logo} />
        </Link>
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
    justifyContent: 'flex-end',
    paddingRight: '20px',
  },
  navLink: {
    marginLeft: '20px',
    textDecoration: 'none',
    color: '#000',
    cursor: 'pointer',
  },
};

export default Header;
