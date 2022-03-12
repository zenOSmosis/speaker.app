[![GPL-3.0 License][license-image]][license-url]
[![ci][ci-image]][ci-url]
[![CodeFactor][codefactor-image]][codefactor-url]
[![tweet-url][tweet-image]][tweet-url]

[license-image]: https://img.shields.io/github/license/zenosmosis/speaker.app
[license-url]: https://raw.githubusercontent.com/zenOSmosis/speaker.app/master/LICENSE.txt
[ci-image]: https://github.com/zenosmosis/speaker.app/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/zenOSmosis/speaker.app/actions
[codefactor-image]: https://www.codefactor.io/repository/github/zenOSmosis/speaker.app/badge
[codefactor-url]: https://www.codefactor.io/repository/github/zenOSmosis/speaker.app
[tweet-image]: https://img.shields.io/twitter/url/http/shields.io.svg?style=social
[tweet-url]: https://twitter.com/intent/tweet?text=Private%20audio%20chat%20rooms%20using%20your%20browser%20as%20a%20virtual%20server&url=https://github.com/zenOSmosis/speaker.app&hashtags=webrtc,audio,screensharing,virtual-server,group-chat,communications,private

# Speaker.app / zenRTC / Phantom Server

**This branch contains a highly experimental user interface (UI); For the original Speaker.app, use this branch: https://github.com/zenOSmosis/speaker.app/tree/original-speaker-app**

**This program is a work in progress, the console may be spammy, and it may not work at all, however, [an older, stable version should be running here](https://speaker.app).**

[Speaker.app](https://speaker.app) is a [batteries-included](#whats-in-the-box), quasi-decentralized, alternative free speech audio platform that is compatible on any device that supports a modern web browser.

Rather than a centralized server providing proxying of streams from each participant to other participants (i.e. an MCU / SFU), one can choose to host a network (or "room") where others can connect to, either publicly or privately. The network hosting participant's web browser acts as the "server" for the other participants to connect to on the given network, and all proxying is done, including message storage and relaying, through that browser.

Public networks are visible in a "network discovery" view, which serves as the default homepage for the application.

No user accounts or passwords are required to join a public network, and user identities are generated using Ethereum, with a randomized user profile, by default. Users can change their user profile to their liking, while their profile information is stored locally via local storage.

To see it live, navigate to [https://speaker.app](https://speaker.app).

## Table of Contents

- [Speaker.app / zenRTC / Phantom Server](#speakerapp--zenrtc--phantom-server)
  - [Table of Contents](#table-of-contents)
  - [Browser Support Matrix](#browser-support-matrix)
  - [What's in the Box](#whats-in-the-box)
  - [WebRTC Topology Overview](#webrtc-topology-overview)
    - [Conventional WebRTC Network Topologies](#conventional-webrtc-network-topologies)
    - [Speaker.app Peer-Based Network Topology](#speakerapp-peer-based-network-topology)
  - [Inspiration to Create this Project](#inspiration-to-create-this-project)
  - [Getting Started](#getting-started)
    - [Dependencies / System Requirements](#dependencies--system-requirements)
    - [Building and Running](#building-and-running)
  - [Public Network Discovery / Private Networks](#public-network-discovery--private-networks)
  - [Testing](#testing)
  - [Contributing / Forking](#contributing--forking)
  - [Troubleshooting / Miscellaneous](#troubleshooting--miscellaneous)
    - [gyp ERR! stack Error: not found: make](#gyp-err-stack-error-not-found-make)
    - [Invalid MongoDB Permissions (or some other missing environment variable)](#invalid-mongodb-permissions-or-some-other-missing-environment-variable)
    - [Invalid Elf header (farmhash)](#invalid-elf-header-farmhash)
    - [Error: ENOSPC: System limit for number of file watchers reached](#error-enospc-system-limit-for-number-of-file-watchers-reached)
    - [Linux check CPU speed](#linux-check-cpu-speed)
    - [Auto-Generate Markdown Table of Contents](#auto-generate-markdown-table-of-contents)
  - [Motto](#motto)
  - [Help Us Continue Writing Free Software](#help-us-continue-writing-free-software)
  - [License](#license)

## Browser Support Matrix

|             | Chrome                     | Edge (Chromium) | Firefox | Safari | IE  |
| ----------- | -------------------------- | --------------- | ------- | ------ | --- |
| **Android** | ✓                          | ✓               | ✓       | N/A    | N/A |
| **iOS**     | [Virtual Server host only] | N/A             | N/A     | ✓      | N/A |
| **Linux**   | ✓                          | ✓               | ✓       | N/A    | N/A |
| **macOS**   | ✓                          | ✓               | ✓       | ✓      | N/A |
| **Windows** | ✓                          | ✓               | ✓       | N/A    | N/A |

Note, on every OS except iOS, Chrome is the recommended browser; On iOS, Safari should be used.

## What's in the Box

**Frontend**: [ReShell Web Desktop](https://github.com/zenOSmosis/reshell) mobile / desktop switchable paradigms, built with [Create React App](https://create-react-app.dev/).

**Backend:** Node.js app, using [Socket.io](https://github.com/socketio/socket.io) and [Express](https://github.com/expressjs/express). Cluster module is utilized to utilize multiple CPUs and a Redis store is utilize to scale Socket.io across the CPUs.

**MongoDB**: Network details (name, host, number of participants) are stored in [MongoDB](https://github.com/mongodb/mongo). When in development mode, [Mongo Express](https://github.com/mongo-express/mongo-express) is available at http://localhost:8081, and provides a web-based administrative interface.

**Redis**: Utilized with [Socket.io's Redis adapter](https://socket.io/docs/v4/redis-adapter) to provide scalability of Socket.io across a cluster of Node.js running in different processes or servers, so they can all communicate, broadcast, and emit events to and from one another. _This is mostly used in conjunction with the signaling layer to initiate WebRTC sessions & media, and most private communication happens over WebRTC data channels._

**Let's Encrypt**: Free SSL certificates are managed via the [linuxserver.io/docker-swag Docker](https://github.com/linuxserver/docker-swag) image.

**dev-ssl-proxy**: In development, a [self-signed SSL proxy](https://github.com/zenOSmosis/docker-dev-ssl-proxy) is utilized in replacement of Let's Encrypt, to enable local development with SSL turned on (cam / mic / other HTML5-related APIs which require SSL by default).

**Coturn**: A [STUN / TURN server](https://github.com/zenOSmosis/docker-coturn) for WebRTC NAT traversal is included in the Docker Compose configuration, but is not enabled by default.

**Included WebRTC Experiments**: Within the source code are some previous real-time, shared experience experiments such as a drum looper, a sound sampler (play piano / electric guitar w/ keyboard), text-to-speech, TensorFlow-based skeletal tracker, and a game emulator.

These experiments are mostly dormant and commented-out, but have made for some interesting demos in the past and may be re-enabled in the future.

## WebRTC Topology Overview

### Conventional WebRTC Network Topologies

![Mesh Network](/assets/network/mesh.svg)

_Mesh network example. (Illustration borrowed from [simple-peer](https://www.npmjs.com/package/simple-peer))_

Most group-based WebRTC calls, which don't have a centralized MCU / SFU rely on each peer to send out an extra stream to multiple peer. This is not very efficient as for every participant added, every device connected must send out additional streams.

![SFU](/assets/network/sfu.svg)

_Centralized MCU / SFU example._

More advanced calling platforms utilize a centralized MCU / SFU. While this is more efficient in terms of the network, additional considerations, and money, are needed in order to scale out the backend infrastructure.

### Speaker.app Peer-Based Network Topology

Using a topology similar to the MCU / SFU example above, Speaker.app attempts to solve the scalability issue without throwing a lot of extra money into hosting fees, by enabling individual participants to host their own networks, on their own hardware, using their own bandwidth, while at the same time providing greater privacy and flexibility.

**zenRTC** (built with simple-peer) is based on WebRTC, adding additional functionality such as user-level network strength indication, events over data channels, and P2P-based shared state syncing.

**Phantom Server** is a network host which runs in your web browser, and acts as the host, shared state manager, proxy, and virtualServer for all connected participants within a WebRTC network.

Every participant connects to the Phantom Server via a P2P connection and Phantom Server handles the stream negotiations / network programming with the other peers.

Speaker.app is able to provide a quasi-decentralized MCU / SFU by enabling clients to run them in their own browsers, as a virtual machine.

_At the time of writing the Chrome on the Apple M1 processor is by far the most efficient for doing browser-based streaming transcoding, compared to a variety of Intel processors which have been tested on, though development has mostly been done on Intel processors / Linux. ARM is the future, it seems._

_Network hosting has also been tested on non-optimal hardware (i.e. 2018 Samsung J2; Intel i3) with adequate results for streaming 4K video streams to 4 participants. Good hardware such as the new Apple M1 processor allows much greater yields, and better scalability._

## Inspiration to Create this Project

_TLDR; Experimentation._

I was faced with a task for building a WebRTC bridge between two third party services in the virtual healthcare industry and after trying some various approaches, discovered that using a headless Chrome instance on the server was the path of least effort and less bugs to squash, though not necessarily being greatly efficient on its own.

Running a headless Chrome instance on the server is very versatile, in being that you've got a really solid WebRTC implementation baked in, with the ability to mix audio and video streams using JavaScript and the real DOM.

Wanting to continue pursuing the effort of a script-able WebRTC bridge using a web browser, and thinking of ways to potentially scale such a system, I made the decision to allow client-side devices to host these sessions, now no longer utilizing the headless Chrome instances as the main method of hosting sessions.

## Getting Started

**NOTE: If you wish to host your own network (or room) you DO NOT HAVE TO DO this, and can instead go [https://speaker.app/setup/network/create](https://speaker.app/setup/network/create) and create your own network!**

**The following is ONLY if you wish to host the entire infrastructure yourself.**

### Dependencies / System Requirements

**All environments require**

- Bash (Unix shell) _If running the included Bash build scripts_
- Docker
- Docker Compose

**Development environments require**

- Node.js 12+

**Recommended system requirements**

The following should get the system up and running, though additional resources may be required for higher traffic environments. Presumably, these minimum requirements should host at least several dozen people concurrently before needing to add more RAM.

- 2048 MB RAM _(1048 MAY work if Coturn server is hosted separately)_
- Two CPU cores _(one should work just fine for low traffic environments)_

### Building and Running

Some Bash scripts have been provided to help facilitate the starting and stopping of the respective environments. It is recommended to use these scripts instead of calling the Docker commands directly, as they will provide supplemental environment variables as well as any additional build instructions.

In development environments, most of the container volumes have a mount directly to the host so that the source code can be updated in the containers without rebuilding. See the respective docker.compose\*.yml configurations and corresponding Dockerfile files for more details.

_Set up the environment_

Copy the sample environment.

```bash
$ cp .env.sample .env
```

Then populate .env with the configuration relevant to your environment.

Note that other environment variables are set within the docker-compose\*.yml files and are intended to be considered static.

_To build the Docker containers_

Note that development environments may require additional [dependencies](#dependencies--system-requirements) to be installed.

_IMPORTANT: If you are using a shell other than Bash, the following scripts should be proceeded with the "bash" command (i.e. "bash ./build.prod.sh")._

```bash
$ ./build.prod.sh # Or ./build.dev.sh, depending on environment
```

_To start the containers_

```bash
$ ./start.prod.sh # Or ./start.dev.sh, depending on environment
```

_To stop the containers_

This stops the containers and tears down their temporary storage.

```bash
$ ./stop.sh # Stops any environment
```

## Public Network Discovery / Private Networks

Public networks can be discovered on the default home page. Private networks do not appear in the public network discovery but can be accessed via URL or QR code.

## Testing

Testing can be performed by running:

```bash
$ ./test.sh
```

Note, development packages will be automatically installed locally when testing.

At this time, testing is not fully automated. Several internal utilities are tested using Jest (via the above command), while device-specific testing is performed manually using [BrowserStack](https://www.browserstack.com).

<a href="https://www.browserstack.com" target="_blank"><img src="https://github.com/zenOSmosis/js-shell/raw/master/assets/BrowserStack-logo.svg" alt="BrowserStack" width="320"></a>

## Contributing / Forking

Source-code contributions and forks are welcome!

[Open an issue](https://github.com/zenOSmosis/speaker.app/issues) if you find something that needs to be addressed that you aren't going to address yourself.

For ideas of what to contribute, take a look at our [open issues](https://github.com/zenOSmosis/speaker.app/issues).

To contribute, fork the repository, create a new branch, add some code or documentation updates, then submit a PR.

## Troubleshooting / Miscellaneous

### gyp ERR! stack Error: not found: make

On Ubuntu:

```bash
$ sudo apt-get install build-essential
```

CENTOS / RHEL 7

```bash
$ RUN yum install -y make gcc*
```

### Invalid MongoDB Permissions (or some other missing environment variable)

Refer to environment setup in [Building and Running](#building-and-running).

### Invalid Elf header (farmhash)

Related to scaling Socket.io across CPU cores. Make sure all npm installs are executed on the same platform as used during runtime. See https://github.com/lovell/farmhash/issues/21.

### Error: ENOSPC: System limit for number of file watchers reached

Solution: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
Reference: https://github.com/gatsbyjs/gatsby/issues/11406 (note, Gatsby is not utilized in this project)

### Linux check CPU speed

Leftover artifact when after doing some headless Chrome testing and seeing how the CPU was being throttled. Might be useful in the future.

`lscpu | grep MHz`

### Auto-Generate Markdown Table of Contents

Update this document and have it automatically generate the table of contents in VS Code: **Markdown All in One Extension**

## Motto

To contribute, however slightly, to the commonwealth of all human innovation and experience.

## Help Us Continue Writing Free Software

**PayPal**: https://www.paypal.com/paypalme/zenOSmosis

**Buy Me a Coffee**: https://www.buymeacoffee.com/Kg8VCULYI

## License

[GNU GENERAL PUBLIC LICENSE](LICENSE.txt) Copyright (c) 2010 - 2022 [zenOSmosis](https://zenosmosis.com). Included works are bound by their own copyrights and licensing and are not necessarily affiliated with zenOSmosis.
