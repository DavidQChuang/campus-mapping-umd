#!/bin/zsh

git_dir=$(pwd)
rm "$git_dir/gps_csv_files/combined_file.csv"

for i in $git_dir/gps_csv_files/Test-files/*.gpx; do
    dir=$(dirname "$i")
    filename=$(basename "$i")
    filename="${filename%.*}"
    echo "$dir/$filename"
    /Volumes/GPSBabelFE/GPSBabelFE.app/Contents/MacOs/gpsbabel -t -i gpx -f "$i" -x track,speed -o gpx,gpxver=1.0 -F "$i"
    /Volumes/GPSBabelFE/GPSBabelFE.app/Contents/MacOs/gpsbabel -t -i gpx -f "$dir/$filename.gpx"  -x track,speed -o unicsv -F "$git_dir/gps_csv_files/Test-files/CSV/$filename.csv";
done

source $git_dir/venv/bin/activate
python3 $git_dir/combine-csv.py