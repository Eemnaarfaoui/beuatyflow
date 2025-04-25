
# 🚀 Project Setup and Development Guide

This guide will help you set up the project locally for development.  
The stack used includes:

- **Frontend:** Angular 19
- **Backend:** Python Flask
- **Databases:** 
  - MongoDB Atlas (Users data)
  - SQL Server (Supply Chain Data Warehouse)

---

## 📦 Prerequisites

| Tool         | Version (or higher) | Download Link                             |
| ------------ | ------------------- | ----------------------------------------- |
| Node.js      | 20.x                 | [Download Node.js](https://nodejs.org/)   |
| Angular CLI  | 19.x                 | `npm install -g @angular/cli`             |
| Python       | 3.11+                | [Download Python](https://www.python.org/) |
| SQL Server   | 2017+                | [Download SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| ODBC Driver  | 17 or 18             | [Download ODBC Driver](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server) |
| MongoDB Atlas| -                    | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| MongoDB Compass (optional) | -       | [MongoDB Compass](https://www.mongodb.com/try/download/compass) |

---

## 🛠️ Backend Setup (Flask + SQL Server + MongoDB)

1. **Clone the project:**
   ```bash
   git clone  https://github.com/your-username/beuatyflow.git
   cd your-repo-name/backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```


3. **Configure Database Connections:**
   
   - Open `init.py` and **update** your SQL Server settings:

     ```python
     # SQL Server connection configuration
     server = "your_server_name"          # Example: "localhost" or "192.168.1.5"
     database = "your_database_name"      # Example: "DW_SupplyChain"
     driver = "ODBC Driver 17 for SQL Server"  # Or "ODBC Driver 18 for SQL Server"
     ```

   - No changes are needed for the MongoDB Atlas connection (already cloud-hosted).

4. **Run the Flask backend:**
   ```bash
   .venv\Scripts\activate
   python run.py
   ```
   Backend will start running at [http://localhost:5000](http://localhost:5000).

---

## 🌐 Frontend Setup (Angular 19)

1. **Navigate to the frontend folder:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```



3. **Run the Angular app:**
   ```bash
   ng serve
   ```
   The frontend will be available at [http://localhost:4200](http://localhost:4200).

---

## 📊 Database Notes

### MongoDB Atlas (Users)

- MongoDB Atlas is already configured in the backend (no changes required).
- You can use **MongoDB Compass** to visualize user data if needed.

### SQL Server (Supply Chain Data Warehouse)

- You **must** update your connection settings in `init.py`.
- Ensure SQL Server and the ODBC driver are properly installed on your machine.
- Example database: `DW_SupplyChain`

---

## 📂 Project Structure

```
/backend      -> Flask backend server (connects to SQL Server and MongoDB Atlas)
/frontend     -> Angular 19 frontend client
README.md     -> Setup and installation guide
```
## 🛠️ Development Guidelines

### Frontend (Angular 19)

- **Pages Organization:**  
  Each page is structured like:
  ```
  /pages/{page-name}/
      ├── components/
      ├── templates/
      ├── services/
      └── {page-name}.routes.ts
  ```
- **Routing:**
  - Per-page routes: `{page-name}.routes.ts`
  - Global routes: `src/app/app.routes.ts`

- **UI Kit:**
  - Reusable components under `src/app/ui-kit/`

- **Sidebar Menu:**
  - Managed from `src/app/app.menu.ts`

### Backend (Python Flask)

- **Folder Structure:**
  ```
  /backend/
      ├── app/
      │    ├── ml/
      │    ├── models/
      │    ├── routes/
      │    └── __init__.py
      ├── instance/
      ├── venv/
      └── run.py
  ```

- **Implementation Notes:**
  - Routes inside `routes/`
  - Database models inside `models/`
  - ML logic inside `ml/`
  - Register all Blueprints inside `__init__.py`

---

## 🌿 Branching Convention

To ensure a clean and structured Git workflow, please follow these branch naming conventions:

| Branch Type  | Naming Format                | Example                     |
| ------------ | ----------------------------- | --------------------------- |
| Feature      | `feature/{short-description}`  | `feature/add-login-page`    |
| Bugfix       | `bugfix/{short-description}`   | `bugfix/fix-login-error`    |
| Hotfix       | `hotfix/{short-description}`   | `hotfix/fix-crash-on-start` |
| Refactor     | `refactor/{short-description}` | `refactor/cleanup-services` |
| Documentation| `docs/{short-description}`     | `docs/update-readme`        |

**General rules:**
- Always branch off from `main`.
- Use **lowercase letters** and **hyphens** (`-`) to separate words.
- Keep branch names **short but meaningful**.
