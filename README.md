# Tampermonkey Logger - Educational Security Tool

> **Disclaimer:** This tool is for **educational and research purposes only**. It is designed to demonstrate how client-side JavaScript can access and transmit web storage and browser data. **Do not deploy or use this tool without full knowledge and consent of all affected users.**

## Overview

This project demonstrates how a web client (via a Tampermonkey userscript) can collect a variety of browser and device information, and send it to a backend server for logging and analysis.

The backend is built using **Node.js** and **Express**, and supports logging to the file system as well as forwarding data to a **Discord webhook**.

## What It Does

### Userscript Features (`Tampermonkey`):

* Extracts data from:

  * `localStorage`, `sessionStorage`, `cookies`
  * `indexedDB` names
  * `cacheStorage` keys
  * `performance` & `navigation` timing
  * `clipboard` contents (if permitted)
  * `geolocation` (if user consents)
  * Media device metadata
  * Discord token (only on `discord.com`)
* Sends data to a local backend via HTTP requests

### Backend Features (`app.js`):

* Listens on port `443` (changeable)
* Routes:

  * `GET /api/validation`: Simple handshake
  * `POST /api/handler`: Receives, logs, and forwards data
* Logs:

  * Saves requests to `logs/` as `.json`
  * Sends a summary + file to a Discord webhook

## Setup Instructions

### Backend

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `logs` directory if it doesn't exist (handled automatically).

3. Add your **Discord webhook** to the `discordWebhookURL` variable.

4. Run the server:

   ```bash
   node app.js
   ```

> Note: The server listens on port `443`, which typically requires root/admin permissions. Consider changing to port `3000` for local development.

### Userscript

1. Install [Tampermonkey](https://tampermonkey.net/) in your browser.

2. Create a new script and paste the `// ==UserScript== ...` code.

3. Make sure your backend is accessible at `http://localhost:443` or update the script to match the correct server URL.

## License

This code is distributed for **educational purposes** under the **MIT License**. 

---

Let me know if you'd like a **sanitized version** of the Tampermonkey script that only logs harmless public data for ethical testing.

  
![image](https://github.com/user-attachments/assets/50f53468-7c45-4599-acd6-9eb7323c294d)
