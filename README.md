# Unofficial Knockout City Launcher
by Ipmake // IPGsystems

This is a launcher for the self hosted version of Knockout City, developed by Velan Studios.
This launcher is developed by the community and is not affiliated with Velan Studios.

![Screenshot](https://cdn.discordapp.com/attachments/1086346121472905366/1095320783976407120/image.png)

## Installation
1. Download the latest installer from the [releases](https://github.com/Ipmake/kocitylauncher/releases/) page
2. Run the installer
3. If the windows defender message pops up, click "More info" and then "Run anyway"

## Features
- Improve usability by providing basic settings instead of command line arguments
- A basic news feed and a server browser and favorites list
- A clean and modern UI
- Install and update the game through the launcher
- Automatically update the launcher when a new version is released

## To-Do
- [x] Allow hosting of private servers through the launcher
- [ ] Add a public server browser
- [ ] Discord RPC
- [ ] Allow for users to enter secrets for private servers
- [ ] Add an authentication system
- [ ] Some kind of account system with cloud sync (maybe)

## Building from Source
0. Make sure you have nodejs installed (recommend the latest LTS version)
1. Clone the Project and cd into the directory 
2. Run `npm install` to install all dependencies
3. Run `npm run electron:build`, this will build the react and electron project and output an installer exe into the `dist` directory
