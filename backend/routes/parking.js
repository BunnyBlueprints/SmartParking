const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { Slot, Ticket } = require("../database");

const router = express.Router();

function calculateCharge(entryTime, exitTime) {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const diffMs = exit - entry;
  const diffHours = diffMs / (1000 * 60 * 60);

  let amount;
  if (diffHours <= 3) amount = 30;
  else if (diffHours <= 6) amount = 85;
  else amount = 120;

  return { hours: parseFloat(diffHours.toFixed(2)), amount };
}

router.get("/slots", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ vehicle_type: 1, slot_number: 1 }).lean();
    const activeTickets = await Ticket.find({ status: "active" }).lean();
    const ticketBySlotId = new Map(
      activeTickets.map((ticket) => [String(ticket.slot_id), ticket])
    );

    const enrichedSlots = slots.map((slot) => {
      const ticket = ticketBySlotId.get(String(slot._id));

      return {
        id: String(slot._id),
        slot_number: slot.slot_number,
        vehicle_type: slot.vehicle_type,
        is_occupied: slot.is_occupied,
        ticket_id: ticket?.id || null,
        vehicle_number: ticket?.vehicle_number || null,
        entry_time: ticket?.entry_time || null,
      };
    });

    const summary = {
      Bike: { total: 0, available: 0 },
      Car: { total: 0, available: 0 },
      Truck: { total: 0, available: 0 },
    };

    enrichedSlots.forEach((slot) => {
      summary[slot.vehicle_type].total++;
      if (!slot.is_occupied) summary[slot.vehicle_type].available++;
    });

    res.json({ success: true, slots: enrichedSlots, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/park", async (req, res) => {
  const { vehicle_number, vehicle_type } = req.body;

  if (!vehicle_number || !vehicle_type) {
    return res.status(400).json({
      success: false,
      message: "vehicle_number and vehicle_type are required.",
    });
  }

  const validTypes = ["Bike", "Car", "Truck"];
  if (!validTypes.includes(vehicle_type)) {
    return res.status(400).json({
      success: false,
      message: `vehicle_type must be one of: ${validTypes.join(", ")}`,
    });
  }

  const normalizedVehicleNumber = vehicle_number.toUpperCase();
  try {
    const existingTicket = await Ticket.findOne({
      vehicle_number: normalizedVehicleNumber,
      status: "active",
    }).lean();

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${normalizedVehicleNumber} is already parked. Ticket ID: ${existingTicket.id}`,
      });
    }

    const slot = await Slot.findOneAndUpdate(
      { vehicle_type, is_occupied: false },
      { $set: { is_occupied: true } },
      { new: true, sort: { slot_number: 1 } }
    );

    if (!slot) {
      return res.status(200).json({
        success: false,
        message: `Parking Full for ${vehicle_type}s. No slots available.`,
        parking_full: true,
      });
    }

    const ticketId = uuidv4();
    const entryTime = new Date();

    await Ticket.create({
      id: ticketId,
      vehicle_number: normalizedVehicleNumber,
      vehicle_type,
      slot_id: slot._id,
      entry_time: entryTime,
    });

    res.json({
      success: true,
      message: `Vehicle parked successfully in slot ${slot.slot_number}!`,
      ticket: {
        ticket_id: ticketId,
        vehicle_number: normalizedVehicleNumber,
        vehicle_type,
        slot_number: slot.slot_number,
        entry_time: entryTime.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/exit", async (req, res) => {
  const { ticket_id, vehicle_number } = req.body;

  if (!ticket_id && !vehicle_number) {
    return res.status(400).json({
      success: false,
      message: "Provide either ticket_id or vehicle_number.",
    });
  }

  try {
    const ticket = await Ticket.findOne(
      ticket_id
        ? { id: ticket_id, status: "active" }
        : { vehicle_number: vehicle_number.toUpperCase(), status: "active" }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "No active parking ticket found for the provided details.",
      });
    }

    const exitTime = new Date();
    const { hours, amount } = calculateCharge(ticket.entry_time, exitTime);

    ticket.exit_time = exitTime;
    ticket.amount_charged = amount;
    ticket.status = "closed";
    await ticket.save();

    const slot = await Slot.findByIdAndUpdate(
      ticket.slot_id,
      { $set: { is_occupied: false } },
      { new: true }
    ).lean();

    res.json({
      success: true,
      message: "Vehicle exited successfully. Thank you!",
      receipt: {
        ticket_id: ticket.id,
        vehicle_number: ticket.vehicle_number,
        vehicle_type: ticket.vehicle_type,
        slot_number: slot?.slot_number || null,
        entry_time: ticket.entry_time,
        exit_time: exitTime.toISOString(),
        duration_hours: hours,
        amount_charged: amount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: "active" })
      .sort({ entry_time: -1 })
      .populate("slot_id", "slot_number")
      .lean();

    res.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        ...ticket,
        slot_number: ticket.slot_id?.slot_number || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: "closed" })
      .sort({ exit_time: -1 })
      .limit(50)
      .populate("slot_id", "slot_number")
      .lean();

    res.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        ...ticket,
        slot_number: ticket.slot_id?.slot_number || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
