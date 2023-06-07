# Unofficial Knockout City Launcher

This is a launcher for the [Knockout City Private Server Edition][official blog], and is the easiest way for people on PC to play Knockout City on public community servers and private servers now that the official servers are shut down.

This launcher is an unofficial community-run project and is not affiliated with Velan Studios.

Our Website: https://kocity.xyz . : Our discord: https://discord.gg/4kNPb4cRxN

![Screenshot of Knockout City Launcher](https://cdn.discordapp.com/attachments/798935892059488276/1102977194805964800/image.png)

## Installation

I just want to get in a brawl!

1. Download the installer from [releases page][releases].
    - Under Assets, download the `.exe` file.
1. Run the installer. If Windows Defender warns you that it's untrusted, click "More Info", then "Run Anyway".
1. Install the game through the launcher:
    - Choose High Res or Low Res.
    - (Optional) choose an install path in the settings tab.
    - Click the big "INSTALL" button.
1. Log in to Discord.
    - In the settings tab, click the 👤 icon.
1. Choose a server.
    - In the servers tab, click the ➡️ icon next to a server.
1. Click the big LAUNCH button

## Why does this exist?

When Velan Studios shut down the official Knockout City servers on June 6 2023, they released a free version of the game so the community can run private servers and keep brawling. It's a bit fiddly to run, though, and requires passing command line arguments to the executable and knowing a server's IP address.

This launcher gives you a list of community servers and deals with all the command line stuff for you so it's easier to grab a ball and get back in the game.

## What servers are available?

- Public community servers. As of writing this, there are 3 in NA and 2 in EU.
- Private servers, if you know their IP address.
- A local server that you can start through the launcher if you want to play solo or host it for friends.

## Features

Platforms:
- PC: Yes.
- Console: No. Velan can't publish the client on console stores because the official release requires setting command line arguments to run the game. (This is one problem that this launcher tries to solve on PC.)
- Linux / Steam Deck: Probably. At least one person has gotten the game and launcher working.

Launcher features:
- Download and launch the game.
- An easy to use UI, no command line arguments required.
- See a list of public servers and their current player counts.
- Connect to private or public servers.
- Run a private server locally.
- Sign in via Discord.
- Auto-update the launcher and the game.

Game features (whether or not you run through the launcher):
- Private Matches with almost all playlists.
- Street Play matchmaking for Team KO and Face-Off (if there's enough people on a server).
- Bots.
- Almost all cosmetics unlocked for everybody.
- Street Rank.
- Friends, crews, groups.
    - Friend everyone you see so they're easier to find next time.

Each server has its own database for cosmetics, settings, friends, etc. Nothing is transferred between servers. You'll keep your settings within each server as long as you connect with the same username (which you will if you use the launcher and authenticate through Discord).

Not in game:
- League play.
- Seasons, events.
- Voice chat.
- A few cosmetics that they would have had to license. e.g. TMNT crossover, and streamer promotions.
- Anticheat or DRM.
- Official support. Velan released it but it's up to the community to manage it now.
- Reporting players.

Launcher TODO:
- [ ] enter private server secrets instead of discord
- [ ] Discord game invites
- [ ] Some kind of account system with cloud sync (maybe)

## The Details

### Downloading

The Low Res download is 17.0G. The High Res download is 22.4G.

If you've already downloaded the game, you can use the existing files instead of redownloading it.

1. Create a folder somewhere that will house everything
1. Create either a folder either called `lowRes` or `highRes` depending on which version you downloaded.
1. Move the private server editions files into the `highRes` or `lowRes` folder
1. Restart your launcher and click "Yes" when it asks you to create a version.txt

This should be the folder strucutre:

```
Knockout City/
├─ highRes/
│  ├─ KnockoutCity/
│  ├─ KnockoutCityServer/
│  ├─ eula.txt
│  ├─ readme.txt
```

### Connect to a private server

To connect to a server that's not in the public tab:

1. Go to the Servers tab, then Favorites
1. Click the +
1. Enter the server's IP address, and a name.
1. Click the + to save it.
1. Click the ➡️ icon to select the new server. 
1. Click the big "LAUNCH" button.

If the server uses a port besides the default (`23600`), then enter the port alongside the ip address, like `127.0.0.1:50000`.

### Authentication, Discord, and usernames

As released by Velan, a server can require a password to join the server, and when connecting you can choose whatever username you want. This is fine for private games, but for public servers, it would mean anyone can take your username and play with your account.

The launcher and all the public community servers use a layer of authentication on top of this. In the launcher, you authenticate through Discord, and a community-run authentication server talks to the game server so that you can use your username and no one else can. (If you want more details on how it works, here's some [technical documentation][docs proxy].)

This means:
- You will need to sign in to a Discord account to use the launcher and join any game (including locally hosted games).
- Public servers that are listed in the launcher can only be joined through the launcher with a Discord account.
- If you are hosting your own server (through the launcher or not), and you want people (including yourself) to be able to join through the launcher, then you should not set a password.

We want to add a feature to the launcher to give a username and password when connecting to private servers, instead of going through the Discord auth system. Until we get around to that, if you need that feature, you should run the game client directly and pass the username and password as command line arguments.

### Hosting a server

You can host a server easily through the launcher. Go to the Servers tab, then Host.

If you want your friends to connect to a server on your computer, you will probably need to change firewall and router settings.

If you want to run a dedicated server, you may want to read [this documentation][docs] with information about [running in Docker][docs docker] and [authentication][docs proxy]. You should also read the `readme.txt` that comes with the game files download.

If you want your server to appear in the launcher's list of public community servers, fill out [this form][server list form] and also get in touch on the [the discord][discord kocxyz].

### Building the launcher from source

0. Make sure you have nodejs installed (recommend the latest LTS version)
1. Clone the Project and cd into the directory 
2. Run `npm install` to install all dependencies
3. Run `npm run electron:build`, this will build the react and electron project and output an installer exe into the `dist` directory

### Contributing

If you've found a bug, make [a new GitHub Issue][issues].

If you have questions, need help, or have other contributions, join us on the [KOCity.xyz development Discord][discord kocxyz]. We're friendly and contributions are welcome.

## Links

- [The latest release of the launcher][releases].
- [The official Knockout City Discord][discord official].
    - Check out the `#private-server-build` channel.
- [kocity.xyz][kocxyz], the website for this community-run project.
- [Discord for developing this project][discord kocxyz].
- [Discord for The City Never Sleeps (TCNS)][discord tcns].
    - A community of people who are still playing the game, and host one of the public servers.
- [DummyCorps Website][dummycorps].
    - Website for one of the public servers.
- [Official blog post releasing the private server edition][official blog].
    - Has lots of information about the game's features.
    - Has instructions for running the client and server (that you don't need if you use the launcher).
- [Official download page][official download].
    - Has some useful information, like system requirements.
    - Has download links (that you don't need if you download through the launcher).
- There's an official `readme.txt` in the downloaded game files.
- [Technical API docs][docs].

[releases]: https://github.com/Ipmake/kocitylauncher/releases/latest
[discord official]: https://discord.gg/knockoutcity
[kocxyz]: https://kocity.xyz
[discord kocxyz]: https://discord.gg/4kNPb4cRxN
[discord tcns]: https://discord.gg/FdvGezR3YY
[dummycorps]: https://koc.dummycorps.net/
[official blog]: https://www.knockoutcity.com/updates/knockout-city-private-hosted-server-edition
[official download]: https://www.knockoutcity.com/private-server-edition
[docs]: https://kocity.xyz/docs/intro
[docs proxy]: https://kocity.xyz/docs/proxy/intro
[docs docker]: https://kocity.xyz/docs/hosting/docker 
[api servers]: https://api.kocity.xyz/stats/servers
[server list form]: https://cloud.ipmake.me:9001/apps/forms/s/FenZoKcexYxDo3QTeXjCWarW
[issues]: https://github.com/Ipmake/kocitylauncher/issues

## Credits

Huge thanks to:

Ipmake for making this launcher. (He didn't write this thank you, though)

Velan Studios, for releasing the client. This sort of thing is very unusual for a studio. They've really gone above and beyond to support the community even when the game is officially closed and and make all of this possible.

People running private servers, and people who have contributed to hosting costs. It's expensive and the core of how things keep going.

All the other community contributors: Discord moderators, game modders, people who submit bug reports, and so much more. There's a lot of work and care that's gone into making this community what it is.

All the brawlers who are still out there on the streets of Knockout City keeping this community alive. If you're reading this, that's you! Thank you! I'll see you on the streets 💥
