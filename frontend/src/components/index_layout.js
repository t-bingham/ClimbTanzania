import React from 'react';
import Link from 'next/link';
import styles from '../styles/index_layout.module.css'; // Create a CSS module for styling

const IndexLayout = ({ title, columns, data }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={styles[col.className]}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key} className={styles[col.className]}>
                    {col.link ? (
                      <Link href={`${col.link}/${row.id}`} legacyBehavior>
                        <a className={styles.link}>{row[col.key]}</a>
                      </Link>
                    ) : (
                      row[col.key] || 'N/A'
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndexLayout;
