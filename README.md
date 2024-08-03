DECISIONS:

not using dependency injection+class structure for the 2 services:
using a functional approach since it is a small take home task, quicker to tesput together tests etc.(will refactor into classes if I start adding more functionality)

variability of hours etc:
not creating a schedule setup to figure out open days and open hours. easy but will take more time.

per email directions, avoiding time slot booking etc, all I need to do for that is snap to nearest allowed times and return as options on get restaurants. (best left to individual restaurant choice and managed on the frontend. (would cause limitation in booking which would need separate handling) and return the real booking time (better if there is a frontend to show options/return messages about bad times etc)

booking particular tables:
i'm allowing the booking of particular tables, generally a restaurant would have the host handle this as a human load balancer (i think) between server covers. That is not broken here, it just sets a tentative table. Let the restaurant handle it themselves OR let customers book which table they like as a future feature option (ie, by the window) like movie tickets.

database usage:
SQLite as a db (not a product db but better for usage in an example server setup like this, can run in-memory db during testing - run in band, execute without lots of mocks)

did not localize time for restaurant locations. easy to do. just adds time. can add restaurant locations if desired. servr would maintain an ISO 8601.

test usage values:
2024-08-03T20:00:00Z
2024-08-04T21:00:00Z
2024-08-05T18:30:00Z
2024-08-06T19:45:00Z
2024-08-07T20:15:00Z
2024-08-08T21:30:00Z
2024-08-09T18:00:00Z
2024-08-10T19:30:00Z
2024-08-11T20:45:00Z
