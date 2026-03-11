#!/usr/bin/env sh
set -eu

: "${VTP_DEPLOY_HOST:?VTP_DEPLOY_HOST is required}"
: "${VTP_DEPLOY_USER:?VTP_DEPLOY_USER is required}"
: "${VTP_SSH_PRIVATE_KEY:?VTP_SSH_PRIVATE_KEY is required}"

VTP_DEPLOY_PORT="${VTP_DEPLOY_PORT:-22}"
VTP_STATIC_ROOT="${VTP_STATIC_ROOT:-/var/www/verticaltension}"
VTP_STATIC_OWNER="${VTP_STATIC_OWNER:-www-data:www-data}"

if [ ! -d "dist" ]; then
  echo "[deploy-static] dist/ not found. Run build first."
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

# Sync static site atomically enough for SPA hosting (delete stale files).
rsync -az --delete \
  -e "ssh $SSH_BASE_ARGS" \
  dist/ "$VTP_DEPLOY_USER@$VTP_DEPLOY_HOST:$VTP_STATIC_ROOT/"

ssh $SSH_BASE_ARGS "$VTP_DEPLOY_USER@$VTP_DEPLOY_HOST" \
  "chown -R '$VTP_STATIC_OWNER' '$VTP_STATIC_ROOT' && nginx -t && systemctl reload nginx"

echo "[deploy-static] Deployed dist/ to $VTP_DEPLOY_HOST:$VTP_STATIC_ROOT"
