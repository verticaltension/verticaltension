#!/usr/bin/env sh
set -eu

: "${VTP_DEPLOY_HOST:?VTP_DEPLOY_HOST is required}"
: "${VTP_DEPLOY_USER:?VTP_DEPLOY_USER is required}"
: "${VTP_SSH_PRIVATE_KEY:?VTP_SSH_PRIVATE_KEY is required}"

if [ "${VTP_DEPLOY_API:-1}" != "1" ]; then
  echo "[deploy-api] Skipping API deploy because VTP_DEPLOY_API != 1"
  exit 0
fi

VTP_DEPLOY_PORT="${VTP_DEPLOY_PORT:-22}"
VTP_API_ROOT="${VTP_API_ROOT:-/srv/verticaltension-api}"
VTP_API_SERVICE="${VTP_API_SERVICE:-verticaltension-api}"

if [ ! -d "server" ]; then
  echo "[deploy-api] server/ not found."
  exit 1
fi

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

KEY_FILE="$HOME/.ssh/vtp_deploy_ed25519"
KNOWN_HOSTS_FILE="$HOME/.ssh/known_hosts"

printf "%s\n" "$VTP_SSH_PRIVATE_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"
touch "$KNOWN_HOSTS_FILE"
chmod 600 "$KNOWN_HOSTS_FILE"

if [ -n "${VTP_SSH_KNOWN_HOSTS:-}" ]; then
  printf "%s\n" "$VTP_SSH_KNOWN_HOSTS" >> "$KNOWN_HOSTS_FILE"
else
  ssh-keyscan -p "$VTP_DEPLOY_PORT" -H "$VTP_DEPLOY_HOST" >> "$KNOWN_HOSTS_FILE" 2>/dev/null || true
fi

SSH_BASE_ARGS="-i $KEY_FILE -p $VTP_DEPLOY_PORT -o UserKnownHostsFile=$KNOWN_HOSTS_FILE -o StrictHostKeyChecking=yes"

# Sync API source and runtime package manifests to VPS.
rsync -az --delete \
  --exclude ".env" \
  --exclude "node_modules" \
  -e "ssh $SSH_BASE_ARGS" \
  server/ "$VTP_DEPLOY_USER@$VTP_DEPLOY_HOST:$VTP_API_ROOT/server/"

rsync -az \
  -e "ssh $SSH_BASE_ARGS" \
  package.json package-lock.json .env.example "$VTP_DEPLOY_USER@$VTP_DEPLOY_HOST:$VTP_API_ROOT/"

ssh $SSH_BASE_ARGS "$VTP_DEPLOY_USER@$VTP_DEPLOY_HOST" \
  "VTP_API_ROOT='$VTP_API_ROOT' VTP_API_SERVICE='$VTP_API_SERVICE' sh -s" <<'EOF'
set -eu
cd "$VTP_API_ROOT"

if [ -f docker-compose.yml ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "[deploy-api] docker not found on host."
    exit 1
  fi
  docker compose up -d --build --remove-orphans
elif command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files --type=service | grep -q "^${VTP_API_SERVICE}\.service"; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "[deploy-api] npm not found on host and no docker-compose fallback."
    exit 1
  fi
  if [ -f package-lock.json ]; then
    npm ci --omit=dev
  else
    npm install --omit=dev
  fi
  systemctl restart "$VTP_API_SERVICE"
else
  echo "[deploy-api] No restart target found (docker-compose.yml or systemd unit)."
  exit 1
fi
EOF

echo "[deploy-api] Deployed API source to $VTP_DEPLOY_HOST:$VTP_API_ROOT"
