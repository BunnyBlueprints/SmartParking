import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ActiveTickets({ api }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${api}/tickets`);
      setTickets(data.tickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const typeClass = { Bike: "type-bike", Car: "type-car", Truck: "type-truck" };

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: "space-between" }}>
        🎟️ Active Tickets
        <button className="btn btn-ghost" onClick={fetchTickets} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>↻ Refresh</button>
      </div>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="loading-text">No active tickets. Parking lot is empty!</p>
      ) : (
        tickets.map((t) => (
          <div className="ticket-card" key={t.id}>
            <div>
              <div className="ticket-id">#{t.id.slice(0, 8)}...</div>
              <div className="ticket-vehicle">{t.vehicle_number}</div>
              <div className="ticket-meta">Slot: {t.slot_number} · Entry: {new Date(t.entry_time).toLocaleString()}</div>
            </div>
            <span className={`type-badge ${typeClass[t.vehicle_type]}`}>{t.vehicle_type}</span>
          </div>
        ))
      )}
    </div>
  );
}
