import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ParkVehicle from "./components/ParkVehicle";
import ExitVehicle from "./components/ExitVehicle";
import SlotStatus from "./components/SlotStatus";
import ActiveTickets from "./components/ActiveTickets";
import History from "./components/History";
import "./App.css";

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const API = `${API_BASE_URL}/api/parking`;

export default function App() {
  const [tab, setTab] = useState("slots");
  const [slotsData, setSlotsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/slots`);
      setSlotsData(data);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const tabs = [
    { key: "slots", label: "Slots" },
    { key: "park", label: "Park Vehicle" },
    { key: "exit", label: "Exit Vehicle" },
    { key: "tickets", label: "Active Tickets" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Smart Parking</h1>
          <p>Parking Lot Management System</p>
        </div>
        {slotsData && (
          <div className="quick-summary">
            {Object.entries(slotsData.summary).map(([type, info]) => (
              <div key={type} className={`summary-pill ${info.available === 0 ? "full" : ""}`}>
                <span className="pill-label">{type}</span>
                <span className="pill-count">
                  {info.available}/{info.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </header>

      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "slots" && (
          <SlotStatus slotsData={slotsData} loading={loading} onRefresh={fetchSlots} />
        )}
        {tab === "park" && <ParkVehicle api={API} onSuccess={fetchSlots} />}
        {tab === "exit" && <ExitVehicle api={API} onSuccess={fetchSlots} />}
        {tab === "tickets" && <ActiveTickets api={API} />}
        {tab === "history" && <History api={API} />}
      </main>
    </div>
  );
}
