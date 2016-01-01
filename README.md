## About

LaserWeb is a fully functional Laser Cutter Controller which runs over http.  Multiple serial devices can be connected to control multiple machines.

If you would like to help with paying the prototyping costs, you can shoot me a donation on Paypal if you wish:
https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=45DXEXK9LJSWU

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=45DXEXK9LJSWU)


## Community:  
Looking for a nice community of Laser users who like hacking their machines?
Join the "K40 LASER CUTTING ENGRAVING MACHINE" Community on Google Plus - its their inspiration you have to thank for me creating LaserWeb in the first place. 
Join over on https://plus.google.com/communities/118113483589382049502 


## NB NOTE: BROWSER SUPPORT:

This is only test/suppoted on Chrome!  NB, for best results, use Chrome

## Update!  NB
NB:  See the Changelog below, almost DAILY there is new code coming out.
Before running, execute ```cd  LaserWeb; chmod +x update.sh; ./update.sh```
Then every day, run ```./update.sh ```


## Changelog

* 31 Dec 2015: Working Javascript/PaperScript based Raster to GCODE code committed - long way from a fully support Raster Engraving solution, but thats the first most major step done:  See detailed implementation log on https://github.com/openhardwarecoza/LaserWeb/issues/32
* 30 Dec 2014: Added a parametric Tabbed Box Generator based on http://ingegno.be/Manuals/openjscad/boxmaker.html
* 30 Dec 2015: Added a parametric Gear Generator based on hessmer.org/gears/InvoluteSpurGearBuilder.html
* 30 Dec 2015: Added a OpenJSCAD based engine to allow in-Laserweb apps like the ones above
* 27 Dec 2015: Added a little more instructions to readme
* 26 Dec 2015: Consider SVG broken for now. Please test DXF etc  - we may need to switch to a different SVG Library - let me know if you can help
* 25 Dec 2015: Added per-layer (DXF) and per-path (SVG) Laser Power and Feedrate settings to the DXF/SVG Importing code
* 25 Dec 2015: Merry Christmas!  And merged in @oxydum's Grbl-compatible mc.js code
* 24 Dec 2015: Added error handling for /dev/ttyS ports on linux, @Cinezaster contributed a fix for package.json, @oxydum contributed better mc.js code for Grbl lasers
* 23 Dec 2015: @danawoodman contributed code to handle serial port errors elegantly, allow overriding config using environment variables, and add some editor/gitignore to help the developers
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

### Web Application
![LaserWeb](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/screenshots/laserweb.PNG)

### Machine control Widget
![Control Modal](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/screenshots/controlmodal.PNG)

## In-app scale, rotate, scaling of existing GCODE
![Transformation Widget](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/screenshots/Scale Widget.png)

### In-app Parametric Gear Generator 
![Parametric](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/screenshots/parametricgenerator.png)

More in-app Parametric generators coming soon!


More information can be found at http://www.openhardware.co.za

Peter van der Walt https://plus.google.com/+PetervanderWalt/posts under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

You must share the source of your project and notify the original author via email in plain english if you include or use this code, even if it is included or used as a library on the web.



## Serial baud rate

Your Marlin/Smoothie/Grbl based lasercutter should be configured to use a baud rate of 115200, you can set that in Configuration.h for Marlin.  
If you are running a default Lasersaur, its default baud rate is 57600.  I would advise changing that in firmware and recompiling (edit config.c in ./src/ and use Lasaurapp to build and upload)

You can also modify the LaserWeb config.js to change the baud speed to match your machine

NB:  MAKE SURE THE BOARD IS PLUGGED IN BEFORE STARTING LASERWEB. LaserWeb connects to all serial ports on startup (not like pronterface where you connect manually) - this allows us to be simultaneously connected to several machines, the dropdown in the UI allows you to switch between them at will (but that switches the interaction / UI -  it does connect/disconnect (; - good since it allows jobs to continue on one machine while you jog/setup another machine)


## Installation Instructions  (NB See Access instructions below the install instructions)


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
npm install serialport socket.io node-static dotenv```
6. Finally enter ```nodejs server.js```

## Ubuntu MJPG_Streamer Install
1.  Open a terminal
2.  Enter the following command
```sudo apt-get install build-essential libjpeg-dev imagemagick subversion libv4l-dev checkinstall```
3.  Enter ```svn co svn://svn.code.sf.net/p/mjpg-streamer/code/ mjpg-streamer```
4.  Enter ``` cd mjpg-streamer/mjpg-streamer ; make```
5.  Enter ```sudo make install```
6.  Run MJPG_Streamer with a USB Webcam: ```mjpg_streamer -i "/usr/local/lib/input_uvc.so -d /dev/video0 -y  -r 320x240 -f 15" -o "/usr/local/lib/output_http.so -w /usr/local/www"```

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

## Access Instructions

After a successful start, the terminal / command promt should display something like this:

![Successful start](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/terminal.png)

Once you see that, open a web Browser and go to the URL as shown in the terminal (usually 127.0.0.1:8000,  or the IP address of the device running Laserweb for example http://192.168.0.150:8000 - you can also access this IP from any device on the network)

The default port 8000, you can change it by editing config.js.

Access:  http://hostaddress:8000/

## Timelapse

There is a bash script names rrw_timelapse.sh in this repository which you can run on a Linux or BSD machine to generate a timelapse from the built in RRW Webcam server.
