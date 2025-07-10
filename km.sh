#!/bin/bash
# km.sh

KEYS_FILE="$HOME/.creds/me_creds"

# Create directory if it doesn't exist
mkdir -p "$(dirname "$KEYS_FILE")"

save_key() {
    # Check if key already exists and update it, otherwise append
    if grep -q "^$1=" "$KEYS_FILE" 2>/dev/null; then
        # Update existing key
        sed -i "s/^$1=.*/$1=$2/" "$KEYS_FILE"
        echo "Key $1 updated"
    else
        # Add new key
        echo "$1=$2" >> "$KEYS_FILE"
        echo "Key $1 saved"
    fi
}

load_keys() {
    if [ -f "$KEYS_FILE" ]; then
        # Source the file to load variables into current shell
        set -a  # automatically export all variables
        source "$KEYS_FILE"
        set +a  # turn off automatic export
        echo "Keys loaded from $KEYS_FILE"
    else
        echo "No keys file found at $KEYS_FILE"
    fi
}

case "$1" in
    "save")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Error: Key name and value required"
            echo "Usage: $0 save [key_name] [key_value]"
            exit 1
        fi
        save_key "$2" "$3"
        ;;
    "load")
        load_keys
        ;;
    "list")
        if [ -f "$KEYS_FILE" ]; then
            echo "Stored keys:"
            cat "$KEYS_FILE"
        else
            echo "No keys file found"
        fi
        ;;
    *)
        echo "Usage: $0 [save|load|list] [key_name] [key_value]"
        echo "  save: Save a key-value pair"
        echo "  load: Load all keys into current shell"
        echo "  list: Show all stored keys"
        ;;
esac 