[![GPL-3.0 License](https://img.shields.io/github/license/zenosmosis/speaker.app)](https://raw.githubusercontent.com/zenOSmosis/speaker.app/master/LICENSE.txt)
[![ci][ci-image]][ci-url]

[ci-image]: https://github.com/zenosmosis/speaker.app/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/zenOSmosis/speaker.app/actions

# Speaker.app / zenRTC / Phantom Server

[Speaker.app](https://speaker.app) is a [batteries-included](#whats-in-the-box), quasi-decentralized, alternative free speech audio platform that is compatible on any device that supports a modern web browser.

Rather than a centralized server providing proxying of streams from each participant to other participants (i.e. an MCU / SFU), a single participant can choose to host a network (or "room") where others can connect to, either publicly or privately.  The network hosting participant's web browser acts as the "server" for the other participants to connect to on the given network, and all proxying is done, including message storage and relaying, through that browser.

Public networks are visible in a "network discovery" view, which serves as the default homepage for the application.

No user accounts or passwords are required to join a public network, and user identities are generated using Ethereum, with a randomized user profile, by default.  Users can change their user profile to their liking, while their profile information is stored locally via local storage.

To see it live, navigate to [https://speaker.app](https://speaker.app).

## Table of Contents
- [Speaker.app / zenRTC / Phantom Server](#speakerapp--zenrtc--phantom-server)
  - [Table of Contents](#table-of-contents)
  - [Browser Support](#browser-support)
  - [Architecture Overview](#architecture-overview)
    - [Conventional WebRTC Network Topologies](#conventional-webrtc-network-topologies)
    - [Speaker.app Peer-Based Network Topology](#speakerapp-peer-based-network-topology)
    - [Inspiration to Create this Project](#inspiration-to-create-this-project)
    - [Included WebRTC Experiments](#included-webrtc-experiments)
  - [Getting Started](#getting-started)
    - [Dependencies](#dependencies)
    - [What's in the Box](#whats-in-the-box)
    - [Building and Running](#building-and-running)
  - [Public Network Discovery / Private Networks](#public-network-discovery--private-networks)
  - [Testing](#testing)
  - [Contributing / Forking](#contributing--forking)
  - [Troubleshooting / Miscellaneous](#troubleshooting--miscellaneous)
    - [Invalid Elf header (farmhash)](#invalid-elf-header-farmhash)
    - [Error: ENOSPC: System limit for number of file watchers reached](#error-enospc-system-limit-for-number-of-file-watchers-reached)
    - [Linux check CPU speed](#linux-check-cpu-speed)
    - [Auto-Generate Markdown Table of Contents](#auto-generate-markdown-table-of-contents)
  - [Motto](#motto)
  - [Help Us Continue Writing Free Software](#help-us-continue-writing-free-software)
  - [License](#license)

## Browser Support

|             | Chrome                 | Edge (Chromium) | Firefox | Safari |
| ----------- | ---------------------- | --------------- | ------- | ------ |
| **Android** | ✓                      | ✓               | ✓       | N/A    |
| **iOS**     | [transcoder host only] | N/A             | N/A     | ✓      |
| **Linux**   | ✓                      | ✓               | ✓       | N/A    |
| **macOS**   | ✓                      | ✓               | ✓       | ✓      |
| **Windows** | ✓                      | ✓               | ✓       | N/A    |

Note, on every OS except iOS, Chrome is the recommended browser;  On iOS, Safari should be used.


## Architecture Overview

### Conventional WebRTC Network Topologies

![Mesh Network](frontend.web/public/assets/network/mesh.svg) 

*Mesh network example. (Illustration borrowed from [simple-peer](https://www.npmjs.com/package/simple-peer))*

Most group-based WebRTC calls, which don't have a centralized MCU /  SFU rely on each peer to send out an extra stream to multiple peer.  This is not very efficient as for every participant added, every device connected must send out additional streams.


![SFU](frontend.web/public/assets/network/sfu.svg) 

*Centralized MCU / SFU example.*

More advanced calling platforms utilize a centralized MCU / SFU.  While this is more efficient in terms of the network, additional considerations, and money, are needed in order to scale out the backend infrastructure.

### Speaker.app Peer-Based Network Topology

Using a topology similar to the MCU / SFU example above, Speaker.app attempts to solve the scalability issue without throwing a lot of extra money into hosting fees, by enabling individual participants to host their own networks, on their own hardware, using their own bandwidth, while at the same time providing greater privacy and flexibility.

**zenRTC** (built with simple-peer) is based on WebRTC, adding additional functionality such as user-level network strength indication, events over data channels, and P2P-based shared state syncing.

**Phantom Server** is a network host which runs in your web browser, and acts as the host, shared state manager, proxy, and transcoder for all connected participants within a WebRTC network.

Speaker.app is able to provide a quasi-centralized MCU / SFU by enabling clients to run them in their own browsers, as a virtual machine.

*At the time of writing the Chrome on the Apple M1 processor is by far the most efficient for doing browser-based streaming transcoding, compared to a variety of Intel processors which have been tested on, though development has mostly been done on Intel processors / Linux.  ARM is the future, it seems.

Network hosting has also been tested on non-optimal hardware (i.e. 2018 Samsung J2; Intel i3) with adequate results for streaming 4K video streams to 4 participants.  Good hardware such as the new Apple M1 processor allows much greater yields, and better scalability.*


### Inspiration to Create this Project

*TLDR; Experimentation.*

I was faced with a task for building a WebRTC bridge between two third party services in the virtual healthcare industry and after trying some various approaches, discovered that using a headless Chrome instance on the server was the path of least effort and less bugs to squash, though not necessarily being greatly efficient on its own.

Running a headless Chrome instance on the server is very versatile, in being that you've got a really solid WebRTC implementation baked in, with the ability to mix audio and video streams using JavaScript and the real DOM.

Wanting to continue pursuing the effort of a script-able WebRTC bridge using a web browser, and thinking of ways to potentially scale such a system, I made the decision to allow client-side devices to host these sessions, now no longer utilizing the headless Chrome instances as the main method of hosting sessions.

### Included WebRTC Experiments

Within the source code are some previous real-time, shared experience experiments  such as a drum looper, a sound sampler (play piano / electric guitar w/ keyboard), text-to-speech, TensorFlow-based skeletal tracker, and a game emulator.

These experiments are mostly dormant and commented-out, but have made for some interesting demos in the past and may be re-enabled in the future.

## Getting Started

### Dependencies

**All environments require**

- Bash (Unix shell) _If running the included Bash build scripts_
- Docker
- Docker Compose

**Development environments require**

- Node.js 12+

### What's in the Box

**Frontend**:  Built with [create-react-app](https://github.com/facebook/create-react-app); state is managed with multiple Providers and accessible via useContext hooks.

**Backend:** Node.js app, using [Socket.io](https://github.com/socketio/socket.io) and [Express](https://github.com/expressjs/express).  Cluster module is utilized to utilize multiple CPUs and a Redis store is utilize to scale Socket.io across the CPUs.

**MongoDB**: Network details (name, host, number of participants) are stored in [MongoDB](https://github.com/mongodb/mongo).  When in development mode, [Mongo Express](https://github.com/mongo-express/mongo-express) is available at http://localhost:8081, and provides a web-based administrative interface.

**Let's Encrypt**: Free SSL certificates are managed via the [linuxserver.io/docker-swag Docker](https://github.com/linuxserver/docker-swag) image.

**dev-ssl-proxy**: In development, a [self-signed SSL proxy](https://github.com/zenOSmosis/docker-dev-ssl-proxy) is utilized in replacement of Let's Encrypt, to enable local development with SSL turned on (cam / mic / other HTML5-related APIs require SSL by default).

**Coturn**: A [STUN / TURN server](https://github.com/zenOSmosis/docker-coturn) for WebRTC NAT traversal is included in the Docker Compose configuration, but is not enabled by default.

### Building and Running

Some Bash scripts have been provided to help facilitate the starting and stopping of the respective environments. It is recommended to use these scripts instead of calling the Docker commands directly, as they will provide supplemental environment variables as well as any additional build instructions.

In development environments, most of the container volumes have a mount directly to the host so that the source code can be updated in the containers without rebuilding.  See the respective docker.compose*.yml configurations and corresponding Dockerfile files for more details.

*Set up the environment*

Copy the sample environment.

```bash
$ cp .env.sample .env
```

Then populate .env with the configuration relevant to your environment.

Note that other environment variables are set within the docker-compose*.yml files and are intended to be considered static.

*To build the Docker containers*

Note that development environments may require additional [dependencies](#dependencies) to be installed. 


```bash
$ ./build.prod.sh # Or ./build.dev.sh, depending on environment
```
*To start the containers*

```bash
$ ./start.prod.sh # Or ./start.dev.sh, depending on environment
```

*To stop the containers*

This stops the containers and tears down their temporary storage.

```bash
$ ./stop.sh # Stops any environment
```

## Public Network Discovery / Private Networks

Public networks can be discovered on the default home page.  Private networks do not appear in the public network discovery but can be accessed via URL or QR code.

## Testing

Testing can be performed by running:

```bash
$ ./test.sh
```

Note, development packages will be automatically installed locally when testing.

Jest tests / Manual tests via BrowserStack

## Contributing / Forking

Source-code contributions and forks are welcome. [Open an issue](https://github.com/zenOSmosis/speaker.app/issues) if something needs to be addressed.

## Troubleshooting / Miscellaneous

### Invalid Elf header (farmhash)

Related to scaling Socket.io across CPU cores. Make sure all npm installs are executed on the same platform as used during runtime. See https://github.com/lovell/farmhash/issues/21

### Error: ENOSPC: System limit for number of file watchers reached

Solution: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
Reference: https://github.com/gatsbyjs/gatsby/issues/11406 (note, Gatsby is not utilized in this project)

### Linux check CPU speed

Leftover artifact when after doing some headless Chrome testing and seeing how the CPU was being throttled.  Might be useful in the future.

`lscpu | grep MHz`

### Auto-Generate Markdown Table of Contents

Update this document and have it automatically generate the table of contents in VS Code: **Markdown All in One Extension**

## Motto

To contribute, however slightly, to the commonwealth of all human innovation and experience.

## Help Us Continue Writing Free Software

**PayPal**: https://www.paypal.com/paypalme/zenOSmosis

**Buy Me a Coffee**:  https://www.buymeacoffee.com/Kg8VCULYI

## License

[GNU GENERAL PUBLIC LICENSE](LICENSE.txt)
