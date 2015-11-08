#!/bin/bash

while [ "$1" != "" ]; do
  argstring="$argstring ${1}"
  shift;
done

LANG=C /root/localperl/bin/perl /root/Slic3r/slic3r.pl $argstring;
