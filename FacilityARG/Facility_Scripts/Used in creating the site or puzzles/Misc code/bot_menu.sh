#!/bin/bash
# Facility Discord Bot Control Menu
# Tested on Nest Hack Club server running Ubuntu

# Facility Discord Bot Control Menu
BOT_DIR="$HOME/Facility_DiscordBot"
VENV="$BOT_DIR/venv"
SERVICE="facilitybot.service"

# Activate virtual environment
activate_venv() {
    source "$VENV/bin/activate"
}

start_interactive() {
    activate_venv
    echo "Starting bot interactively. Press Ctrl+C to stop."
    python "$BOT_DIR/script.py"
}

start_background() {
    systemctl --user start "$SERVICE"
    echo "Bot started in background via systemd service."
}

stop_background() {
    systemctl --user stop "$SERVICE"
    echo "Background bot stopped."
}

check_python_status() {
    activate_venv
    echo "Python version and installed packages:"
    python --version
    pip list
}

check_server_status() {
    echo "Linux server load and memory usage:"
    uptime
    free -h
}

check_discord_status() {
    echo "Checking Discord bot process:"
    pgrep -af "python.*script.py" || echo "Bot not running interactively."
}

check_service_status() {
    systemctl --user status "$SERVICE" --no-pager
}

update_git_restart() {
    echo "Stopping service..."
    systemctl --user stop "$SERVICE"
    cd "$BOT_DIR" || return
    echo "Pulling latest from Git..."
    git pull
    echo "Restarting service..."
    systemctl --user start "$SERVICE"
    echo "Update complete."
}

while true; do
    clear
    echo "=== Facility Discord Bot Control ==="
    echo "1) Start interactive"
    echo "2) Start in background permanently"
    echo "3) Stop background"
    echo "4) Check python status"
    echo "5) Check server status"
    echo "6) Check discord status (interactive)"
    echo "7) Check linux server service status"
    echo "8) Update from Git and restart"
    echo "9) Exit"
    echo -n "Choose an option: "
    read -r choice

    case "$choice" in
        1) start_interactive ;;
        2) start_background ;;
        3) stop_background ;;
        4) check_python_status ;;
        5) check_server_status ;;
        6) check_discord_status ;;
        7) check_service_status ;;
        8) update_git_restart ;;
        9) exit 0 ;;
        *) echo "Invalid option. Press Enter to continue." ; read ;;
    esac
    echo "Press Enter to continue..."
    read -r
done
