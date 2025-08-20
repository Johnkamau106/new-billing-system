import React from 'react';
import './Card.css';

const Card = ({ title, value, prefix = "", change, changeType }) => {
  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">{title}</h3>
      </div>
      <div className="card__content">
        <div className="card__value">{prefix}{value}</div>
        {change && (
          <div className={`card__change card__change--${changeType}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
