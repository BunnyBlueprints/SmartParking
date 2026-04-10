const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const slotSchema = new mongoose.Schema(
  {
    slot_number: { type: String, required: true, unique: true },
    vehicle_type: {
      type: String,
      required: true,
      enum: ["Bike", "Car", "Truck"],
    },
    is_occupied: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const ticketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    vehicle_number: { type: String, required: true },
    vehicle_type: {
      type: String,
      required: true,
      enum: ["Bike", "Car", "Truck"],
    },
    slot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    entry_time: { type: Date, required: true },
    exit_time: { type: Date, default: null },
    amount_charged: { type: Number, default: null },
    status: {
      type: String,
      required: true,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { versionKey: false }
);

const Slot = mongoose.models.Slot || mongoose.model("Slot", slotSchema);
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

async function initializeDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required.");
  }

  await mongoose.connect(MONGODB_URI);

  const seedSlots = [
    { slot_number: "B-1", vehicle_type: "Bike" },
    { slot_number: "B-2", vehicle_type: "Bike" },
    { slot_number: "B-3", vehicle_type: "Bike" },
    { slot_number: "B-4", vehicle_type: "Bike" },
    { slot_number: "B-5", vehicle_type: "Bike" },
    { slot_number: "C-1", vehicle_type: "Car" },
    { slot_number: "C-2", vehicle_type: "Car" },
    { slot_number: "C-3", vehicle_type: "Car" },
    { slot_number: "C-4", vehicle_type: "Car" },
    { slot_number: "C-5", vehicle_type: "Car" },
    { slot_number: "T-1", vehicle_type: "Truck" },
    { slot_number: "T-2", vehicle_type: "Truck" },
  ];

  for (const slot of seedSlots) {
    await Slot.updateOne(
      { slot_number: slot.slot_number },
      { $setOnInsert: { ...slot, is_occupied: false } },
      { upsert: true }
    );
  }
}

module.exports = {
  Slot,
  Ticket,
  initializeDatabase,
  mongoose,
};
