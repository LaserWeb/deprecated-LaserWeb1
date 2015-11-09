## About

LaserWeb is a fully function Laser Cutter Controller which runs over http.  Multiple serial devices can be connected to control multiple machines.

![Screenshot 9 Nov 2015](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb/master/laserweb.PNG)

More information can be found at http://xyzbots.com (soon)

Copyright 2015 Andrew Hodel andrewhodel@gmail.com  under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3

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

Your Marlin based lasercutter should be configured to use a baud rate of 115200, you can set that in Configuration.h for Marlin.  You can also modify the RepRapWeb config.js to change it's speed.


## Installation Instructions


#### Windows

On Windows 7 and above, please use the following instructions. We are assuming from a vanilla Windows installation so your mileage may vary depending on things you already have installed. If you find conflicts, please let us know via a GitHub Issue

1. Starting with a vanilla Windows 7 (or higher, should be fine) installation
2. Download and Install the **free** [Windows SDK 7.1](http://www.microsoft.com/en-us/download/details.aspx?id=8279) and select every option (you can unselect options if you absolutely know what you are doing by unselecting them, but it is easier just to select all options).
3. Install [node.js 0.10.12+](http://nodejs.org/) using the preferred compiler settings, either [32-bit](http://nodejs.org/dist/v0.10.12/node-v0.10.12-x86.msi) or [64-bit](http://nodejs.org/dist/v0.10.12/x64/node-v0.10.12-x64.msi). Those are Microsoft Installer (MSI) format, if you prefer .exe binaries, please obtain those from [here](http://nodejs.org/download/). Default settings are perfect.
4. Install [Python 2.7.5](http://www.python.org/download/releases/2.7.5/) for any questions, please refer to their [FAQ](http://docs.python.org/2/faq/windows.html). Default settings are perfect.
5. Open the Windows SDK 7.1 Command prompt (this allows the C++ compiler to be available on the path). You might have to run the command prompt as Administrator
6. Enter the following command in the prompt which adds Python to the path (the Python installed doesn't do this for you).<pre>set path=%path%;C:\Python27</pre>
7. Download and install Node.js version node-v0.12.7 (NOTE:  At the time of writing SerialPort is not supported on Node,js 4.0+) from https://nodejs.org/download/release/v0.12.7/
8. Open a command prompt and 'cd' to where you want to install LaserWeb (for example 'cd c:\users\Peter\Desktop')
9.  git clone https://github.com/openhardwarecoza/LaserWeb.git
10.  cd LaserWeb
11.  npm install
```

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
