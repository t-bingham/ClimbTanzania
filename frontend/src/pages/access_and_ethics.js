import fs from 'fs';
import path from 'path';

const AccessAndEthics = ({ content }) => {
  const paragraphs = content.split('\n').map((para, index) => (
    <p key={index} style={styles.textBlock}>{para}</p>
  ));

  return (
    <div>
      <div style={{ paddingTop: '80px', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={styles.title}>Access and Ethics</h1>
        {paragraphs}
      </div>
    </div>
  );
};

export const getStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'content', 'access_and_ethics_info.txt');
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', filePath, error);
  }

  return {
    props: {
      content,
    },
  };
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

export default AccessAndEthics;
