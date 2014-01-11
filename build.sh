#!/bin/sh

choice=""

echo
echo "Select component to build"
echo "1) scg"
echo "2) scs"
echo "---"

read component

build_file=''

case $component in
	'1') build_file='scg/build.json';;
        '2') build_file='scs/build.json';;
        *)   echo "You have selected unknown component to build";;
esac

echo
echo "Build component interface (0):"
echo "1 - build; 0 - do not build"
echo

read build_interface

build_interface_flag='0'

case $build_interface in
	'1') build_interface_flag='1';;
	'0') build_interface_flag='0';;
	*)   echo "Unknown option " $build_interface_flag " will be used"
esac

echo
echo "Start building"
python scripts/concatenate_js.py $build_file $build_interface_flag

