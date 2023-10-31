#!/bin/zsh

rm ~/Desktop/gps_csv_files/combined_file.csv

for i in ~/Desktop/gps_csv_files/Test-files/*.gpx; do
    dir=$(dirname "$i")
    filename=$(basename "$i")
    filename="${filename%.*}"
    echo "$dir/$filename"
    /Volumes/GPSBabelFE/GPSBabelFE.app/Contents/MacOs/gpsbabel -t -i gpx -f "$i" -x track,speed -o gpx,gpxver=1.0 -F "$i"
    /Volumes/GPSBabelFE/GPSBabelFE.app/Contents/MacOs/gpsbabel -t -i gpx -f "$dir/$filename.gpx"  -x track,speed -o unicsv -F "/Users/shriyanssairy/Desktop/gps_csv_files/Test-files/CSV/$filename.csv";
done

source ~/Desktop/FIRE-Algorithm-Testing/venv/bin/activate
python3 ~/Desktop/FIRE-Algorithm-Testing/combine-csv.py