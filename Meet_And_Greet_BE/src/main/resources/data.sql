-- Users
INSERT INTO user (id, first_name, last_name, password, email)
VALUES
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d20', '-', '')), 'Hafiz', 'abc', '12345678', 'Hafiz@example.com'),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d21', '-', '')), 'Salman', 'amin', '123456789', 'Salman@example.com'),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d22', '-', '')), 'Chris', '', '123456780', 'Chris@example.com')
AS user_values
ON DUPLICATE KEY UPDATE
    first_name = user_values.first_name,
    last_name = user_values.last_name,
    password = user_values.password,
    email = user_values.email;

-- Rooms
INSERT INTO room (id, name, description, location, capacity, deleted)
VALUES
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d23', '-', '')), 'Conference Room', 'Small room for team meetings.', '2nd Floor', 5, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d24', '-', '')), 'Grand Hall', 'Spacious room for presentations.', '3rd Floor', 10, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d25', '-', '')), 'Innovation Hub', 'Large room for workshops.', '3rd Floor', 15, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d26', '-', '')), 'Focus Room', 'Quiet room for small discussions.', '2nd Floor', 5, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d28', '-', '')), 'Executive Boardroom', 'Room for board meetings.', '3rd Floor', 10, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d39', '-', '')), 'Collaboration Corner', 'Flexible space for brainstorming.', '2nd Floor', 5, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d42', '-', '')), 'The Atrium', 'Large room for town halls.', '3rd Floor', 10, FALSE),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d43', '-', '')), 'Tech Lab', 'Room for product demos.', '3rd Floor', 15, FALSE)
AS room_values
ON DUPLICATE KEY UPDATE
    name = room_values.name,
    description = room_values.description,
    location = room_values.location,
    capacity = room_values.capacity;


-- Bookings
INSERT INTO booking (id, name, start_time, end_time, room_id, user_id)
VALUES
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d46', '-', '')), 'Team Meeting', '2024-09-16T10:30:00', '2024-09-16T11:30:00', UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d23', '-', '')), UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d20', '-', ''))),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d47', '-', '')), 'AI Hackathon', '2024-09-16T11:30:00', '2024-09-16T01:00:00', UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d24', '-', '')), UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d21', '-', ''))),
    (UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d48', '-', '')),'Scrum Meeting', '2024-09-16T02:00:00', '2024-09-16T03:00:00', UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d25', '-', '')), UNHEX(REPLACE('065ef47b-118d-4d0b-a8d6-cf589ec79d22', '-', '')))

AS booking_values
ON DUPLICATE KEY UPDATE
    name = booking_values.name,
    start_time = booking_values.start_time,
    end_time = booking_values.end_time,
    user_id = booking_values.user_id,
    room_id = booking_values.room_id;


