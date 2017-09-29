# GMusic Organizer

A node.js playlist organizer for google play music running in a terminal. Powered by [blessed](https://github.com/chjj/blessed) and [playmusic](https://github.com/jamon/playmusic).

![Screenshot](screenshot.png)

## Installation

The dependency tree contains native node.js modules. Parts of them need to be compiled during installation. So you need a C++ toolchain (compiler/linker) on your machine.

#### Ubuntu 16.04

`sudo apt-get install libasound-dev`

`sudo npm install -g gmusic-organizer`

#### Mac OS

`sudo npm install -g gmusic-organizer`

## Usage

After installation restart your terminal window. Start with `gmusic-organizer`.

When starting the first time, you need to enter your google credentials.

If the login step fails, you might need to:
- allow less [secure apps](https://support.google.com/accounts/answer/6010255?hl=en)  to work with your account
- create an [app specific password](https://support.google.com/accounts/answer/185833?hl=en) (usually required when two-factor authentication is enabled
) 

After a successful authentication, a master token is created and stored in `~/.gmusic-organizer`.

Hit `h` to get a list of available controls.

```
General

 h             help (show this window) 
 F5            refresh
 q             quit

Built in player

 p             play songs 
 s             stop playing 
 P             pause playing 
 R             resume playing

Playlist management
 
 n             create new playlist 
 del/backspace delete playlist

Playlist manipulation
 
 C-c           copy song to clipboard 
 C-x           cut song to clipboard 
 C-v           paste song into playlist
 del/backspace remove song from playlist
```