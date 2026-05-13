# Backend setup

## Database setup

The backend uses PostgreSQL with Entity Framework Core.

### Start PostgreSQL locally

Run this command from the root folder of the project:

```bash
docker compose up -d
```

The root folder is the folder that contains the `docker-compose.yml` file.

Example:

```text
OneSake/
├── backend/
├── frontend/
├── docker-compose.yml
```

### Connection string

For local development, the backend expects this connection string in:

```text
backend/OneSake.Server/appsettings.Development.json
```

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=onesake;Username=onesake;Password=onesake"
  }
}
```

### Apply migrations

Run this command from the `backend` folder:

```bash
dotnet ef database update --project OneSake.Persistence --startup-project OneSake.Server
```

The `backend` folder is this folder:

```text
OneSake/backend
```

Example path on Windows:

```text
C:\Users\Tino\schule\OneSake\backend
```

### Current schema

The first database version creates a `Cards` table for One Piece card data.
