import React, { useState } from "react";
import axios from "axios";

export default function ExitVehicle({ api, onSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState("vehicle_number");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    if (!identifier.trim()) {
      setResult({ type: "error", message: "Please enter a ticket ID or vehicle number." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload =
        identifierType === "vehicle_number"
          ? { vehicle_number: identifier }
          : { ticket_id: identifier };

      const { data } = await axios.post(`${api}/exit`, payload);
      if (data.success) {
        setResult({ type: "success", receipt: data.receipt });
        setIdentifier("");
        onSuccess();
      } else {
        setResult({ type: "error", message: data.message });
      }
    } catch (err) {
      setResult({ type: "error", message: err.response?.data?.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  const receipt = result?.receipt;

  return (
    <div className="card" style={{ maxWidth: 500 }}>
      <div className="card-title">🚪 Exit a Vehicle</div>

      <div className="form-group">
        <label>Search By</label>
        <select value={identifierType} onChange={(e) => setIdentifierType(e.target.value)}>
          <option value="vehicle_number">Vehicle Number</option>
          <option value="ticket_id">Ticket ID</option>
        </select>
      </div>

      <div className="form-group">
        <label>{identifierType === "vehicle_number" ? "Vehicle Number" : "Ticket ID"}</label>
        <input
          type="text"
          placeholder={identifierType === "vehicle_number" ? "e.g. MH12AB1234" : "Paste ticket ID"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>

      <button className="btn btn-danger" onClick={handleExit} disabled={loading}>
        {loading ? "Processing..." : "🚪 Exit & Generate Bill"}
      </button>

      {result && (
        <div style={{ marginTop: "1rem" }}>
          {result.type === "error" && (
            <div className="alert alert-error">❌ {result.message}</div>
          )}
          {result.type === "success" && receipt && (
            <div className="receipt">
              <div className="receipt-title">🧾 Exit Receipt</div>
              {[
                ["Vehicle", receipt.vehicle_number],
                ["Type", receipt.vehicle_type],
                ["Slot", receipt.slot_number],
                ["Entry", new Date(receipt.entry_time).toLocaleString()],
                ["Exit", new Date(receipt.exit_time).toLocaleString()],
                ["Duration", `${receipt.duration_hours} hrs`],
              ].map(([label, value]) => (
                <div className="receipt-row" key={label}>
                  <span className="receipt-label">{label}</span>
                  <span className="receipt-value">{value}</span>
                </div>
              ))}
              <div className="receipt-row receipt-total">
                <span className="receipt-label">💰 Amount Due</span>
                <span className="receipt-value">₹{receipt.amount_charged}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
