#!/usr/bin/env bash
# Starts the API for end-to-end tests against a freshly reset database.
# Everything is overridable through E2E_* environment variables (see e2e/README.md).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${E2E_BACKEND_DIR:-$SCRIPT_DIR/../../../Hotel-Management-backend}"

DB_HOST="${E2E_DB_HOST:-localhost}"
DB_PORT="${E2E_DB_PORT:-5433}"
DB_USER="${E2E_DB_USER:-postgres}"
DB_PASSWORD="${E2E_DB_PASSWORD:-hotel1234}"
DB_NAME="${E2E_DB_NAME:-HotelManagementE2E}"
BACKEND_PORT="${E2E_BACKEND_PORT:-5051}"
FRONTEND_PORT="${E2E_FRONTEND_PORT:-3051}"

# Start from an empty database; the API recreates it by running migrations on startup
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -q \
  -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE);"

# "E2E" is neither Development (no demo data) nor Production (the default SuperAdmin is seeded)
export ASPNETCORE_ENVIRONMENT=E2E
export ConnectionStrings__DefaultConnection="Host=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD"
export JwtSettings__Secret="e2e-tests-signing-key-not-for-production-use"
export Cors__AllowedOrigins__0="http://localhost:$FRONTEND_PORT"

DOTNET="${DOTNET:-$(command -v dotnet || echo "$HOME/.dotnet/dotnet")}"
exec "$DOTNET" run --project "$BACKEND_DIR/HotelManagement.csproj" --no-launch-profile --urls "http://localhost:$BACKEND_PORT"
