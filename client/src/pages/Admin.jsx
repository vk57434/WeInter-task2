import { useEffect, useState } from "react";

function Admin() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/leaderboard")
      .then(res => res.json())
      .then(setScores);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Admin Leaderboard
      </h2>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow-lg p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Name</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={i} className="border-b">
                <td>{s.name}</td>
                <td>{s.score}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;

