## About

LaserWeb is a fully function Laser Cutter Controller which runs over http.  Multiple serial devices can be connected to control multiple machines.
m
If you would like to help with paying the prototyping costs, you can shoot me a donation on Paypal if you wish:
https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=45DXEXK9LJSWU 

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=45DXEXK9LJSWU)

## NB NOTE: BROWSER SUPPORT: 

This is only test/suppoted on Chrome!  NB, for best results, use Chrome

## Changelog

* 22 Dec 2015: Added capability to run various controllers off one PC, all with different firmwares. Switching in the browser's dropdown between serial ports, changes the UI to match the firmware in use on that port!  Groundbreaking!
* 22 Dec 2015: Added Grbl Support
* 21 Dec 2015: Added Lasersaur Support - Autodetect which firmware is loaded on the machine, and adapts Gcode dialect, UI elements, etc to suit the features of the attached machine
* 20 Dec 2015: Added a right-click context menu to 3D viewer
* 20 Dec 2015: Fixed Window resize didnt fix viewport bug
* 16 Dec 2015: Added Webcam Widget
* 15 Dec 2015: Added Scale, Translate, Flip functions
* 15 Dec 2015: Added Support for SmoothieBoard / SmoothieWare to Master branch
* 15 Dec 2015: Added Clear GCode button instead of clearing GCode automatically. Helps if you want to repeat same job a few times. 
* 19 Nov 2015: Upgraded to latest socket.io and serialport versions (Socket.io 1.3.7 and SerialPort 2.0.5) since there are precompiled binaries for Windows - no more recompile required
* 18 Nov 2015: Upgraded to Bootstrap 3.3.5 and changed to a responsive layout
* 17 Nov 2015: Integrated Millcrum.com libraries to provide DXF, SVG and MILLCRUM support 
* 10 Nov 2015: Added FontAwesome icons, moved Jogging to a Modal widget so its out of the way when not in use
* 8 Nov 2015:  Project started

![Screenshot 16 Nov 2015](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/laserweb.PNG)
![Screenshot 16 Nov 2015](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/controlmodal.PNG)
![Screenshot 16 Nov 2015](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/Scale Widget.png)



More information can be found at http://xyzbots.com (soon)  and http://www.openhardware.co.za

Copyright 2015 Andrew Hodel andrewhodel@gmail.com and Peter van der Walt https://plus.google.com/+PetervanderWalt/posts under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

You must share the source of your project and notify the original author via email in plain english if you include or use this code, even if it is included or used as a library on the web.

If you would like to include this code in a project which is not licensed under the AGPL V3, please contact the author at andrewhodel@gmail.com


## Serial baud rate

Your Marlin/Smoothie/Grbl based lasercutter should be configured to use a baud rate of 115200, you can set that in Configuration.h for Marlin.  
If you are running a default Lasersaur, its default baud rate is 57600.  I would advise changing that in firmware and recompiling (edit config.c in ./src/ and use Lasaurapp to build and upload)

You can also modify the LaserWeb config.js to change the baud speed to match your machine


## Installation Instructions


## Windows

On Windows 7 and above, please use the following instructions. We are assuming from a vanilla Windows installation so your mileage may vary depending on things you already have installed. If you find conflicts, please let us know via a GitHub Issue

1. Starting with a vanilla Windows 7 (or higher, should be fine) installation
2. Download and install Node.js version node-v0.12.7 (NOTE:  At the time of writing SerialPort is not supported on Node,js 4.0+) from https://nodejs.org/download/release/v0.12.7/
3. Open a command prompt and 'cd' to where you want to install LaserWeb (for example 'cd c:\users\Peter\Desktop')
4.  git clone https://github.com/openhardwarecoza/LaserWeb.git
5.  cd LaserWeb
6.  npm install  (ignore any errors about socket.io failing to find vcbuild.exe, it has a built in fallback to pure JS when that happens, so its still fine.)



## Ubuntu

Procedure courtery of @quillford : https://github.com/openhardwarecoza/LaserWeb/pull/10

1. Open a terminal
2. Enter the following command
```sudo apt-get install nodejs nodejs-legacy npm build-essential git```
3. Go to the directory you would like to install LaserWeb in by entering ```cd Desktop``` for example
4. Enter ```git clone https://github.com/openhardwarecoza/LaserWeb.git``` then ```cd LaserWeb```
5. Next install the npm modules by entering the following```
npm install serialport socket.io node-static```
6. Finally enter ```nodejs server.js```

## Ubuntu MJPG_Streamer Install
1.  Open a terminal
2.  Enter the following command
```sudo apt-get install build-essential libjpeg-dev imagemagick subversion libv4l-dev checkinstall```
3.  Enter ```svn co svn://svn.code.sf.net/p/mjpg-streamer/code/ mjpg-streamer```
4.  Enter ``` cd mjpg-streamer/mjpg-streamer ; make```
5.  Enter ```sudo make install```
6.  Run MJPG_Streamer with a USB Wbcam: ```mjpg_streamer -i "/usr/local/lib/input_uvc.so -d /dev/video0 -y  -r 320x240 -f 15" -o "/usr/local/lib/output_http.so -w /usr/local/www"```

## Raspberry Pi 2 (Jessie)

Procedure courtery of @LordFennec : https://github.com/openhardwarecoza/LaserWeb/pull/3

1. Open a terminal
2. Enter the following command
```sudo apt-get install build-essential python g++ make```
3. Install node.js for the Raspberry Pi using this script: https://github.com/midnightcodr/rpi_node_install
4. Go to the directory you would like to install LaserWeb in by entering ```cd Desktop``` for example
5. Enter ```git clone https://github.com/openhardwarecoza/LaserWeb.git``` then ```cd LaserWeb```
6. Next install the npm modules by entering the following
```npm install serialport@1.6.1```
```npm install socket.io node-static```
7. Finally enter ```nodejs server.js```



## Mac OS X

Procedure courtery of @quillford : https://github.com/openhardwarecoza/LaserWeb/pull/10

1. Download and install nodejs version node-v0.12.7 (NOTE:  At the time of writing SerialPort is not supported on Node,js 4.0+) from https://nodejs.org/download/release/v0.12.7/    Note2: Compiling SerialPort sometimes fails. Read the auhors blog post about why its hard to manage over at http://www.voodootikigod.com/on-maintaining-a-native-node-module/
2. ```cd``` to a directory to put LaserWeb in
3. Open a terminal and enter ```git clone https://github.com/openhardwarecoza/LaserWeb.git```
4. Enter ```cd LaserWeb``` in the terminal window
5. Enter ```npm install```
6. Now you can start it with ```node server.js```

## Config

edit config.js to change serial baud rate and web port
edit /i/gcode-viewer/ui.js to change size of your laser's bed

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

## Timelapse

There is a bash script names rrw_timelapse.sh in this repository which you can run on a Linux or BSD machine to generate a timelapse from the built in RRW Webcam server.
