-- Covers the booking_seats.seat_id foreign key (seat deletion checks).
create index booking_seats_seat_idx on public.booking_seats (seat_id);
