// Import the required modules
const express = require('express');
const cors = require('cors');

// Create a new Express application
const app = express();
const port = 3000;

// Middleware to allow cross-origin requests and parse JSON bodies
app.use(cors());
app.use(express.json());

// In-memory data structure to store seat information
const seats = {};
const totalSeats = 50;
const lockDuration = 60000; // 60 seconds in milliseconds

// Initialize all seats as 'available'
for (let i = 1; i <= totalSeats; i++) {
    seats[i] = {
        status: 'available',
        lockedBy: null,
        lockedAt: null
    };
}

// Function to handle automatic lock expiry
const checkLocks = () => {
    const now = Date.now();
    for (const seatId in seats) {
        const seat = seats[seatId];
        if (seat.status === 'locked' && now - seat.lockedAt > lockDuration) {
            console.log(`Lock for seat ${seatId} has expired.`);
            seat.status = 'available';
            seat.lockedBy = null;
            seat.lockedAt = null;
        }
    }
};

// Periodically check for expired locks
setInterval(checkLocks, 5000);

// ----- GET /seats: View all available seats -----
// This endpoint returns the status of all seats, including availability, booked status,
// or locked status. This is useful for front-end applications to display a seating chart.
app.get('/seats', (req, res) => {
    // Return a copy of the seats object to prevent external modification.
    res.json(seats);
});

// ----- POST /lock/:seatId: Temporarily lock a seat -----
// This endpoint allows a user to lock a seat, preventing others from booking it
// for a limited time. A user ID is required in the request body to identify the locker.
app.post('/lock/:seatId', (req, res) => {
    // Get the seatId from the URL parameter and userId from the request body.
    const seatId = req.params.seatId;
    const { userId } = req.body;

    // Validate request body
    if (!userId) {
        return res.status(400).json({ error: 'userId is required in the request body.' });
    }

    const seat = seats[seatId];

// Check if the seat exists
    if (!seat) {
        return res.status(404).json({ error: 'Seat not found.' });
    }

    // Handle race conditions and different seat statuses
    if (seat.status === 'booked') {
        return res.status(409).json({ error: `Seat ${seatId} is already booked.` });
    }

    if (seat.status === 'locked') {
        if (seat.lockedBy === userId) {
            // User is trying to re-lock their own seat. Extend the lock time.
            seat.lockedAt = Date.now();
            return res.json({ message: `Seat ${seatId} lock extended.` });
        } else {
            // Another user is trying to lock an already locked seat.
            return res.status(409).json({ error: `Seat ${seatId} is already locked by another user.` });
        }
    }

    // Lock the seat for the current user
    seat.status = 'locked';
    seat.lockedBy = userId;
    seat.lockedAt = Date.now();

    res.json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

// ----- POST /confirm/:seatId: Confirm a seat booking -----
// This endpoint permanently books a locked seat. The request must include the
// user ID that currently holds the lock on the seat.
app.post('/confirm/:seatId', (req, res) => {
    // Get the seatId from the URL parameter and userId from the request body.
    const seatId = req.params.seatId;
    const { userId } = req.body;

    // Validate request body
    if (!userId) {
        return res.status(400).json({ error: 'userId is required in the request body.' });
    }

    // Ensure seatId is a string to match the keys in the seats object
    const seat = seats[String(seatId)];

    // Check if the seat exists
    if (!seat) {
        return res.status(404).json({ error: 'Seat not found.' });
    }

    // Ensure the seat is locked and by the correct user
    if (seat.status !== 'locked') {
        return res.status(400).json({ "message": "Seat is not locked and cannot be booked" });
    }

    if (seat.lockedBy !== userId) {
        return res.status(403).json({ error: 'Seat is not locked by this user.' });
    }

    // Confirm the booking
    seat.status = 'booked';
    seat.lockedBy = null;
    seat.lockedAt = null;

    res.json({ message: `Seat ${seatId} booked successfully!` });
});

// Start the server and listen on the specified port.
app.listen(port, () => {
    console.log(`Ticket booking API is running on http://localhost:${port}`);
    console.log(`Total seats available: ${totalSeats}`);
    console.log('\nEndpoints:');
    console.log('GET  /seats           - View all seat statuses.');
    console.log('POST /lock/:id        - Lock a seat. Body: { "userId": "user123" }');
    console.log('POST /confirm/:id     - Confirm a booking. Body: { "userId": "user123" }');
});
