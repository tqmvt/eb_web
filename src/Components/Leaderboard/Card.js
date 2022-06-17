import React from 'react';
import styles from './styles.module.scss';

export default function Card({ title, totalVolume, name, onClick, active }) {
  return (
    <div className={`${styles.card} ${active ? `${styles.active}` : ''}`} onClick={onClick}>
      <h3 className="mb-0">{title}</h3>
      <h3>{totalVolume} CRO</h3>
      <div className="d-flex justify-content-between">
        <h3 className="mb-0">#1 {name}</h3>
      </div>
    </div>
  );
}
