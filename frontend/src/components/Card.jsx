// src/components/Card.jsx
function Card({ title, value, prefix = "" }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-2xl font-bold">{prefix}{value}</p>
    </div>
  );
}

export default Card;
