# Smart Business Operations & Client Management System

NEX/INT/26/083 – Web Development (MERN: MongoDB, Express, React, Node)

## Features
- Registration, login (JWT) and role-based access: **admin**, **staff**, **client**
- Client profiles, service requests, quotations (with line items) and project records
- Admin/staff dashboard with status charts, recent requests and CSV reports
- Search and filters on every list, in-app notifications
- Accepting a quotation creates a project automatically
- Responsive layout for desktop and mobile

## Run in GitHub Codespaces (or locally)
**1. Backend**
```bash
cd server
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed              # creates admin@example.com / Admin@123 and staff@example.com / Admin@123
npm run dev               # http://localhost:5000
```
**2. Frontend** (second terminal)
```bash
cd client
npm install
npm run dev               # http://localhost:5173
```
Open the forwarded port 5173 from the Ports tab. The frontend proxies `/api` to the backend, so no extra setup is needed.

## Roles
| Role | Can do |
|------|--------|
| Admin | Everything, including delete |
| Staff | Manage clients, requests, quotations, projects. Register with the `STAFF_CODE` from `.env` |
| Client | Register normally. Create requests, view own quotations (accept/reject), view own projects |

## Deployment
- Backend: Render (root `server`, start `npm start`). Set `MONGO_URI`, `JWT_SECRET`, `STAFF_CODE`, `CLIENT_URL`.
- Frontend: Vercel/Netlify (root `client`, build `npm run build`, output `dist`). Set `VITE_API_URL=https://<backend-url>/api`.
- Run `npm run seed` once against the production database to create the admin user.

## API overview
`/api/auth` · `/api/clients` · `/api/requests` · `/api/quotations` · `/api/projects` · `/api/notifications` · `/api/dashboard`
