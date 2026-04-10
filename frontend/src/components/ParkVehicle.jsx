import React, { useState } from "react";
import axios from "axios";

export default function ParkVehicle({ api, onSuccess }) {
  const [form, setForm] = useState({ vehicle_number: "", vehicle_type: "Car" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.vehicle_number.trim()) {
      setResult({ type: "error", message: "Please enter a vehicle number." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(`${api}/park`, form);
      if (data.success) {
        setResult({ type: "success", ticket: data.ticket, message: data.message });
        setForm({ vehicle_number: "", vehicle_type: "Car" });
        onSuccess();
      } else {
        setResult({ type: data.parking_full ? "error" : "error", message: data.message });
      }
    } catch (err) {
      setResult({ type: "error", message: err.response?.data?.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 500 }}>
      <div className="card-title">🚗 Park a Vehicle</div>

      <div className="form-group">
        <label>Vehicle Number</label>
        <input
          type="text"
          placeholder="e.g. MH12AB1234"
          value={form.vehicle_number}
          onChange={(e) => setForm({ ...form, vehicle_number: e.target.value.toUpperCase() })}
        />
      </div>

      <div className="form-group">
        <label>Vehicle Type</label>
        <select
          value={form.vehicle_type}
          onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
        >
          <option>Bike</option>
          <option>Car</option>
          <option>Truck</option>
        </select>
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Parking..." : "🅿️ Park Vehicle"}
      </button>

      {result && (
        <div style={{ marginTop: "1rem" }}>
          {result.type === "error" && (
            <div className="alert alert-error">❌ {result.message}</div>
          )}
          {result.type === "success" && result.ticket && (
            <div className="receipt">
              <div className="receipt-title">🎟️ Parking Ticket</div>
              {[
                ["Ticket ID", result.ticket.ticket_id.slice(0, 8) + "..."],
                ["Vehicle", result.ticket.vehicle_number],
                ["Type", result.ticket.vehicle_type],
                ["Slot", result.ticket.slot_number],
                ["Entry Time", new Date(result.ticket.entry_time).toLocaleString()],
              ].map(([label, value]) => (
                <div className="receipt-row" key={label}>
                  <span className="receipt-label">{label}</span>
                  <span className="receipt-value">{value}</span>
                </div>
              ))}
              <div className="alert alert-success" style={{ marginTop: "1rem" }}>
                ✅ {result.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
