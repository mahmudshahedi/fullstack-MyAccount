// Initialize users collection
db = db.getSiblingDB('mydb');

// Create unique index on username
db.users.createIndex({ username: 1 }, { unique: true });

// Insert default users
const passwordHash = "$2b$10$JS2uMfw6wniuF0bN9.l5Z.0NgcwunCBdEy6TTBX4Impkkb9hXYpWO";

// Super Admin
db.users.insertOne({
  username: "Shahedi",
  password: passwordHash,
  name: "shahedi",
  email: "shahedimahmud@gmail.com",
  role: "SUPER_ADMIN",
  createdAt: new Date()
});

// Admin
db.users.insertOne({
  username: "Shahedi1",
  password: passwordHash,
  name: "shahedi1",
  email: "shahedimahmud1@gmail.com",
  role: "ADMIN",
  createdAt: new Date()
});

// Regular User
db.users.insertOne({
  username: "Shahedi2",
  password: passwordHash,
  name: "shahedi2",
  email: "shahedimahmud2@gmail.com",
  role: "USER",
  createdAt: new Date()
});

print('Users created successfully!');

