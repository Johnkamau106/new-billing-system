// src/components/Card.jsx
function Card({ title, value, prefix = "" }) {
  return (
    <div className="card">
      <h2 className="card__title">{title}</h2>
      <p className="card__value">{prefix}{value}</p>
    </div>
  );
}

export default Card;
