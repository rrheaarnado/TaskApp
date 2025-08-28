# TaskApp (Monorepo)

A learning project built to practice **full-stack development** using:

- **Backend:** C# ASP.NET + EF Core (SQL Server)
- **Frontend:** React (Vite) + Tailwind CSS v4
- **Database:** SQL Server Express / LocalDB

---
## Repository Structure

```
TaskApp/
  backend/    # ASP.NET API: Program.cs, Controllers/, Data/, Models/
  frontend/   # React app: src/, package.json, vite.config.js
  .gitignore  # Ignores build outputs, node_modules, secrets
  README.md   # Project overview + run instructions
```

---
## How to Run

### Backend (API)

```bash
cd backend
dotnet restore
dotnet run
```

Default URL: **http://localhost:5004**

---

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Default URL: **http://localhost:5173**

---

## Database Migrations (EF Core)

```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Notes

- `.gitignore` keeps build output and local config (like `node_modules/`, `bin/`, `obj/`, and `appsettings.Development.json`) out of Git.  
- Use **Conventional Commits** style:  
  - `feat:` new features  
  - `fix:` bug fixes  
  - `chore:` setup/maintenance  
