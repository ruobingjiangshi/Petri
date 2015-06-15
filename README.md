# Petri
An open source Agar.io server implementation, written in Node.js. Heavily based off [Ogar](https://github.com/forairan/Ogar).

## Project Status
Playerbots are currently basic and for testing purposes. To use them, change "serverBots" to a value higher than zero (I like to use 50) in the config field of GameServer.js.


## Obtaining and Using
If you are on Windows, Petri does not require an installation of node.js to run. Simply launch the batch file that is included to run the server. This is a beta feature, and if there are any problems, switch back to using Petri with node.js. The rest of this section is for non Windows users. Raise issues with this functionality [here](https://github.com/forairan/Ogar/issues)

As Petri is written in Node.js, you must have Node.js and its "ws" module installed to use it (Unless you are on Windows). You can usually download Node using your distribution's package manager (for *nix-like systems), or from [the Node website](http://nodejs.org). To install the "ws" module that is required, open up your system command line (cmd for windows, terminal for mac) and type "npm install ws".

Although Ogar allows you to run both the Agar.io master server and game server separately, it's currently recommended that you run both servers together until the master server is more implemented. Alternatively, you could run the game server only, and use a client-side mod to connect to the IP address of the server.

```sh
~$ git clone git://github.com/yrsegal/Petri.git Petri
~$ npm install ./Petri
~$ node Petri
```

Currently, Petri listens on the following addresses and ports:
* *:80 - for the master server
* *:443 - for the game server

Please note that on some systems, you may have to run the process as root or otherwise elevate your privileges to allow the process to listen on the needed ports.

## Configuring Petri
Use gameserver.ini to modify Petri's configurations field.

## Contributing
Please see [CONTRIBUTING.md](https://github.com/yrsegal/Petri/blob/master/CONTRIBUTING.md) for contribution guidelines.

## License
Please see [LICENSE.md](https://github.com/yrsegal/Petri/blob/master/LICENSE.md).
