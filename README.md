
# Pull Request Bot

This bot, built using Nest.js, tracks events on GitHub and sends notifications to Discord.

## Table of Contents

1. [Project Name and Description](#project-name-and-description)
2. [Installation](#installation-if-needed-to-update-the-code)
3. [Usage](#usage)
4. [Features](#features)

## Project Name and Description

**Pull Request Bot** is a server-side application designed to monitor GitHub events and send corresponding notifications to a specified Discord channel. This project leverages the Nest.js framework for its backend infrastructure and integrates with Discord's Webhooks API for real-time communication.

## Installation ***(if needed to update the code)***

  1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/github-discord-bot.git
   cd github-discord-bot
   ```

  2. Install dependencies:
   ```bash
   npm install
 ```

  3. Set up environment variables:
   Create a .env file in the root of the project and add variables indicated in .env.example

  4. Start the server:
   ```bash
   npm run start
  ```

## Usage

### 1. Setting Up Discord Webhook

1.	Open Discord and navigate to your server settings.
2.	Under the “Integrations” tab, click “Create Webhook”.
3.	Name your webhook, select the channel, and copy the webhook ID. For example, if the webhook URL is https://discord.com/api/webhooks/1232338324560094992/bZ5JPBXVdcbv3HtC2sWJZVSKnqPDa2ZiL4xIPc1GNnv3oqeTgfXtyoXTNKsnMpX4YUqR
  the webhook ID is ***1232338324560094992/bZ5JPBXVdcbv3HtC2sWJZVSKnqPDa2ZiL4xIPc1GNnv3oqeTgfXtyoXTNKsnMpX4YUqR***

###  2. Setting Up GitHub Webhook

1.	Go to your GitHub repository’s settings.
2.	Navigate to “Webhooks” and click “Add webhook”.
3.	In the “Payload URL” field, enter the deployed server URL followed by /webhook, and append ?discord_wh_id=your_discord_webhook_id.
4.	Select the events you want to monitor (listed below).
5.	Disable SSL verification if necessary.

### 3. Events to Monitor

1. Pull requests
2. Pull request reviews
3. Pushes

## Features

- ***Real-time Notifications:*** Sends immediate updates to Discord when specified GitHub events occur;
- ***Integration with ClickUp:*** Extracts and displays task information linked in pull request descriptions;
- ***Customizable Notifications:*** Supports editing and updating existing Discord messages based on event changes.
