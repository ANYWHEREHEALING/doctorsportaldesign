#!/usr/bin/env bash
# Invite a practitioner. Usage:
#   bash /root/invite-doctor.sh doctor@clinic.com "Dr. Ana García" "Clínica Sol"
# Reads PORTAL_ADMIN_KEY from the API's .env.
set -euo pipefail
EMAIL=${1:?email}; NAME=${2:-}; CLINIC=${3:-}
KEY=$(grep -E '^PORTAL_ADMIN_KEY=' /root/AnywhereHealing-Backend/server/.env | cut -d= -f2-)
[ -n "$KEY" ] || { echo "PORTAL_ADMIN_KEY missing in server/.env"; exit 1; }
BODY=$(python3 -c 'import json,sys; print(json.dumps({"email":sys.argv[1],"name":sys.argv[2],"clinic":sys.argv[3]}))' "$EMAIL" "$NAME" "$CLINIC")
curl -sS -X POST http://localhost:5800/api/portal/admin/doctors/invite \
  -H "Content-Type: application/json" -H "x-portal-admin-key: $KEY" -d "$BODY"
echo
