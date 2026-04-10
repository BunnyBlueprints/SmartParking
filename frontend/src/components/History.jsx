import React, { useState, useEffect } from "react";
import axios from "axios";

export default function History({ api }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${api}/history`);
      setTickets(data.tickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const typeClass = { Bike: "type-bike", Car: "type-car", Truck: "type-truck" };

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: "space-between" }}>
        📋 Exit History
        <button className="btn btn-ghost" onClick={fetchHistory} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>↻ Refresh</button>
      </div>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="loading-text">No exit history yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Type</th><th>Slot</th><th>Entry</th><th>Exit</th><th>Duration</th><th>Amount</th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.vehicle_number}</td>
                  <td><span className={`type-badge ${typeClass[t.vehicle_type]}`}>{t.vehicle_type}</span></td>
                  <td>{t.slot_number}</td>
                  <td>{new Date(t.entry_time).toLocaleString()}</td>
                  <td>{new Date(t.exit_time).toLocaleString()}</td>
                  <td>{((new Date(t.exit_time) - new Date(t.entry_time)) / 3600000).toFixed(2)}h</td>
                  <td style={{ color: "var(--accent)", fontWeight: 700 }}>₹{t.amount_charged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
