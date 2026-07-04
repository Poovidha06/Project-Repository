// Seeds the database with a default admin account and a few sample items,
// so the app is demoable immediately after `npm install && npm run seed`.

const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function seed() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const studentHash = await bcrypt.hash('Student@123', 10);

  const adminId = uuid();
  const studentId = uuid();

  const data = {
    users: [
      {
        id: adminId,
        name: 'Campus Admin',
        email: 'admin@tce.edu',
        registerNumber: null,
        department: 'Administration',
        year: null,
        phone: '9999999999',
        password: passwordHash,
        role: 'admin',
        profileImage: null,
        reputationScore: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: studentId,
        name: 'Asha Kumar',
        email: 'ashakumar@student.tce.edu',
        registerNumber: 'CS21B045',
        department: 'Computer Science',
        year: '3rd Year',
        phone: '9876543210',
        password: studentHash,
        role: 'student',
        profileImage: null,
        reputationScore: 4,
        createdAt: new Date().toISOString()
      }
    ],
    items: [
      {
        id: uuid(),
        type: 'lost',
        title: 'Navy Blue Water Bottle',
        category: 'Water Bottle',
        description: 'Steel bottle with a dented cap, has a sticker of a mountain on the side.',
        brand: 'Milton',
        color: 'Blue',
        uniqueIdentifiers: 'Small dent near the cap, mountain sticker',
        dateLost: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
        approximateTime: '2:00 PM',
        campusBlock: 'Block A',
        building: 'Main Academic Block',
        floor: '2nd Floor',
        room: '204',
        images: [],
        reward: '',
        contactPreference: 'email',
        anonymous: false,
        additionalNotes: 'Left it near the window seat.',
        owner: studentId,
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: uuid(),
        type: 'found',
        title: 'Black Wired Earphones',
        category: 'Headphones',
        description: 'Black in-ear wired earphones found near the canteen tables.',
        brand: 'boAt',
        color: 'Black',
        uniqueIdentifiers: 'One earbud has a small scratch',
        dateLost: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        approximateTime: '1:00 PM',
        campusBlock: 'Block C',
        building: 'Canteen',
        floor: 'Ground Floor',
        room: '',
        currentItemLocation: 'Security Office',
        images: [],
        reward: '',
        contactPreference: 'anonymous',
        anonymous: true,
        additionalNotes: 'Handed over to the security desk.',
        owner: adminId,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ],
    claims: [],
    notifications: [
      {
        id: uuid(),
        user: studentId,
        title: 'Welcome to Campus Lost & Found',
        message: 'Report a lost item or browse found items to get started.',
        read: false,
        createdAt: new Date().toISOString()
      }
    ],
    bookmarks: [],
    activityLogs: []
  };

  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

  console.log('Database seeded.');
  console.log('Admin login   -> email: admin@tce.edu   password: Admin@123');
  console.log('Student login -> email: ashakumar@student.tce.edu   password: Student@123');
}

seed();
