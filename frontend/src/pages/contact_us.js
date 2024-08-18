const ContactUs = () => {
    return (
      <div>
        <div style={{ paddingTop: '80px', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={styles.title}>Contact Us</h1>
          <div style={styles.textBlock}>
            <p><strong>Name:</strong> Thomas Bingham</p>
            <p><strong>Email:</strong> <a href="mailto:binghamtd@gmail.com">binghamtd@gmail.com</a></p>
            <p><strong>Phone (WhatsApp):</strong> <a href="https://wa.me/64210747699" target="_blank" rel="noopener noreferrer">+64 210 747 699</a></p>
          </div>
        </div>
      </div>
    );
  };
  
  const styles = {
    title: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '32px',
      paddingBottom: '10px',
    },
    textBlock: {
      marginBottom: '20px',
      lineHeight: '1.6',
      fontSize: '18px',
    },
  };
  
  export default ContactUs;
  