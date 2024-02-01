#!/bin/bash

# Start the timer
start_time=$(date +%s%3N)
start_time_seconds=$SECONDS

# Parse command-line parameters or set default values
# ----> Use --dir to give the directory to export the files to <----
if [ "$#" -eq 0 ]; then
    toktx_params="--t2 --encode etc1s --clevel 5 --qlevel 255"
    output_directory="KTX2"
else
    toktx_params="$(echo "$*" | sed -n 's/.*--t2 \(.*\)/\1/p')"
    output_directory="$(echo "$*" | sed -n 's/.*--dir \([^ ]*\) --t2.*/\1/p')"
fi

# Initialize iteration counter
iteration_count=0
shopt -s lastpipe

# Get the script's directory
script_directory="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Specify the root directory
root_directory="$(realpath "$script_directory/../../assets")"

# Extensions to filter
extensions=("png" "jpeg" "jpg")

# Create "KTX2" directory if it doesn't exist
ktx2_directory="$root_directory/$output_directory"
if [ ! -d "$ktx2_directory" ]; then
    mkdir -p "$ktx2_directory"
	 echo "Create directory: $ktx2_directory"
fi

# Iterate through files in the specified directory and its subdirectories
# find "$root_directory" -type f | while read -r file; do
find "$root_directory" -type f \( -iname "*.${extensions[0]}" -o -iname "*.${extensions[1]}" -o -iname "*.${extensions[2]}" \) | while read -r file; do
	# Increment the iteration counter
	iteration_count="$((iteration_count+1))"
	echo "File count: $iteration_count"
	
    # Full path name of every file with extension
    echo "File: $file"

    # Full path name of every file without extension
    file_without_extension="${file%.*}"
    # echo "File without extension: $file_without_extension"

    # Root directory
    # echo "Root directory: $root_directory"

    # Substring of the root directory minus the full path
    substring="${file#$root_directory}"
	substring_without_extension="${substring%.*}"
    # echo "Substring of the root directory: $substring_without_extension"
	
	# Extract the directory path from the substring
    directory_path="$ktx2_directory$(dirname "$substring_without_extension")"
    # echo "Directory path: $directory_path"
	
	if [ ! -d "$directory_path" ]; then
		mkdir -p "$directory_path"
		echo "Create directory: $directory_path"
	fi
	
	# Concatenate root directory, "KTX2", and substring
    new_path="$ktx2_directory$substring_without_extension.ktx2"
	echo "Encoding to KTX2..."
	
	# Run toktx.exe for the current file
    # Info: https://github.khronos.org/KTX-Software/ktxtools/ktxsc.html
    "$script_directory/toktx.exe" $toktx_params "$new_path" "$file"
	echo "Created file: $new_path"

    echo "------------------------"
done

# Calculate and log the elapsed time
end_time=$(date +%s%3N)
end_time_seconds=$SECONDS
elapsed_time=$((end_time - start_time))
elapsed_time_seconds=$((end_time_seconds - start_time_seconds))
echo "Elapsed time: $elapsed_time milliseconds / $elapsed_time_seconds seconds"
echo "Files compressed to KTX2: $iteration_count"

# Calculate and log the average time per iteration
average_time=$((elapsed_time / iteration_count))
average_time_seconds=$((elapsed_time_seconds / iteration_count))
echo "Average time per file: $average_time milliseconds / $average_time_seconds seconds"