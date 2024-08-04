import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <nav style={styles.nav}>
        <Link href="/contact_us" legacyBehavior>
          <a style={styles.navLink}>Contact Us</a>
        </Link>
        <Link href="/info" legacyBehavior>
          <a style={styles.navLink}>Info</a>
        </Link>
        <Link href="/about_us" legacyBehavior>
          <a style={styles.navLink}>About Us</a>
        </Link>
      </nav>
    </footer>
  );
};

const styles = {
  footer: {
    width: '100%',
    padding: '10px 0',
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
    marginTop: 'auto', // Ensures the footer is pushed to the bottom
    zIndex: 100000,
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
  },
  navLink: {
    margin: '0 10px',
    textDecoration: 'none',
    color: '#000',
  },
};

export default Footer;
