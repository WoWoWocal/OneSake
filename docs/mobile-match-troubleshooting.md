# Mobile Match Troubleshooting

## Symptom

`No Connection with that ID: Status code '404'`

This usually means the frontend is pointing SignalR at the wrong backend origin, or the deployed frontend has no `VITE_BACKEND_URL` configured at build time.

## Required frontend variable

Set `VITE_BACKEND_URL` to the backend origin that hosts `/matchHub`.

Examples:

- Local desktop: `VITE_BACKEND_URL=http://localhost:5179`
- Local phone in LAN: `VITE_BACKEND_URL=http://192.168.x.x:5179`
- Production: `VITE_BACKEND_URL=https://api.example.com`

Do not point this variable at the frontend origin unless the frontend host also reverse-proxies `/matchHub` and `/Cards/*` to the backend.

## Local phone testing

1. Start the backend on the LAN profile:
   `dotnet run --project backend\OneSake.Server --launch-profile lan`
2. Start the frontend with LAN access:
   `cd frontend\web`
   `npm run dev -- --host`
3. Open the frontend from the phone with the PC LAN IP.
4. Make sure the phone can also reach the backend origin in `VITE_BACKEND_URL`.

## CORS

The backend must allow the frontend origin.

- Development now accepts loopback and private LAN origins.
- Production should set `Cors:AllowedOrigins` explicitly.

Example `appsettings.Production.json`:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://onesake.world"
    ]
  }
}
```

## Reverse proxy and WebSockets

If frontend and backend are hosted separately:

- `VITE_BACKEND_URL` must point to the backend host.
- The backend host must expose `/matchHub/negotiate`.
- WebSocket upgrades must be forwarded for `/matchHub`.

If a reverse proxy is used on the frontend domain, it must forward:

- `/matchHub`
- `/matchHub/negotiate`
- `/Cards/*`

## Expected behavior after the fix

- Join only opens the board after a successful SignalR join.
- A missing production backend URL fails with a clear configuration error instead of a broken `undefined/matchHub` request.
- Development builds can derive `http://<current-host>:5179` automatically when `VITE_BACKEND_URL` is not set.
