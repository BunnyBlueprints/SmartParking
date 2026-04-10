import React from "react";

const TYPE_EMOJI = { Bike: "🏍️", Car: "🚗", Truck: "🚚" };

export default function SlotStatus({ slotsData, loading, onRefresh }) {
  if (loading) return <p className="loading-text">Loading slots...</p>;
  if (!slotsData) return <p className="loading-text">No data available.</p>;

  const byType = { Bike: [], Car: [], Truck: [] };
  slotsData.slots.forEach((s) => byType[s.vehicle_type]?.push(s));

  return (
    <div>
      <div className="refresh-btn-wrap">
        <button className="btn btn-ghost" onClick={onRefresh}>↻ Refresh</button>
      </div>

      {Object.entries(byType).map(([type, slots]) => (
        <div key={type} className="slot-section">
          <div className="slot-section-title">
            {TYPE_EMOJI[type]} {type} Slots — {slotsData.summary[type].available} of {slotsData.summary[type].total} available
          </div>
          <div className="slot-grid">
            {slots.map((slot) => (
              <div key={slot.id} className={`slot-card ${slot.is_occupied ? "occupied" : "available"}`}>
                <div className="slot-number">{slot.slot_number}</div>
                <span className={`slot-status-badge ${slot.is_occupied ? "badge-occupied" : "badge-available"}`}>
                  {slot.is_occupied ? "Occupied" : "Available"}
                </span>
                {slot.is_occupied && slot.vehicle_number && (
                  <div className="slot-vehicle-info">
                    🚘 {slot.vehicle_number}<br />
                    ⏰ {new Date(slot.entry_time).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
