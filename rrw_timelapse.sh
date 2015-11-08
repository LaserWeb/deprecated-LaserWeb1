#!/usr/bin/env bash

if [ -d "timelapse" ]; then
	echo "Please remove the ./timelapse directory and re-run this script"
	echo ""
	exit
fi

# exit if user gave no args
if [ $# -eq 0 ];then
	echo "RepRapWeb Timelapse Script"
	echo "USAGE:"
	echo "./rrw_timelapse.sh 192.168.0.50 1 4"
	echo "----"
	echo "The example above would create a timelapse from the RRW instance"
	echo "running at the IP Address 192.168.0.50.  Every 1 second a snapshot"
	echo "would be taken and 4 snapshots would go into each second of video"
	echo "----"
	echo "The script will create a directory named timelapse containing all"
	echo "of the timelapse images and a timelapse video named timelapse.mp4"
	echo ""
	exit
fi

echo "Getting Images"
echo "Once the print is done, hit Ctrl-C then the video will generate"
echo ""

# this is your raspberry pi ip address
RPI_IP=$1

# this is the duration between each snapshot, 15 is a good number
TAKE_SNAPSHOT_EVERY_N_SECONDS=$2

# how many snapshots to put in each second of video, 4 is a good number
SNAPSHOTS_PER_SECOND_OF_VIDEO=$3

COUNT=1

# first create a directory for the timelapse
mkdir timelapse

# cd to that directory
cd timelapse

# hit ctrl-c when print is done, trap then uses next command to join the images together and make the "timelapse"
trap "ffmpeg -framerate $SNAPSHOTS_PER_SECOND_OF_VIDEO -start_number 1 -i img%d.jpg -c:v libx264 output.mp4 && exit 0" 2

while [ true ]
do
# get the images from the rpi mjpg streamer
wget http://$RPI_IP:8080/?action=snapshot -q -O img$COUNT.jpg
((COUNT++))
sleep $TAKE_SNAPSHOT_EVERY_N_SECONDS
done
