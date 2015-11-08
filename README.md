## About

RepRapWeb is a fully function 3d Printer Controller which runs over http.  Multiple serial devices can be connected to control multiple machines.

More information can be found at http://xyzbots.com

Copyright 2015 Andrew Hodel andrewhodel@gmail.com under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

You must share the source of your project and notify the original author via email in plain english if you include or use this code, even if it is included or used as a library on the web.

If you would like to include this code in a project which is not licensed under the AGPL V3, please contact the author at andrewhodel@gmail.com

## Raspberry Pi prebuilt Image

There is a prebuilt Rasbperry Pi Image with everything configured.  More information and a link to the .img can be found at http://xyzbots.com

## Serial baud rate

Your printer should be configured to use a baud rate of 115200, you can set that in Configuration.h for Marlin.  You can also modify the RepRapWeb config.js to change it's speed.

## Installation

```
git clone https://github.com/andrewhodel/reprapweb.git
cd reprapweb
npm install
```

## Config

edit config.js to change serial baud rate and web port

## Running

// standalone
```
node server.js
```

// with forever
```
npm install -g forever
forever start server.js
```

## Access

The default port in config.js is 8000, you can change it by editing the file.

http://hostaddress:8000/

## CuraEngine and Slic3r

RepRapWeb expects to find ../CuraEngine/build/CuraEngine and ../Slic3r/slic3r.pl (same directory as reprapweb).

## Timelapse

There is a bash script names rrw_timelapse.sh in this repository which you can run on a Linux or BSD machine to generate a timelapse from the built in RRW Webcam server.
