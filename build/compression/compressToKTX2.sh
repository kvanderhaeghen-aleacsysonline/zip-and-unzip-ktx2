#!/bin/bash

# Start the timer
start_time=$(date +%s%3N)
start_time_seconds=$SECONDS

# Parse command-line parameters or set default values
# ----> Use --dir to give the directory to export the files to <----
if [ "$#" -eq 0 ]; then
    toktx_params="--encode basis-lz --clevel 5 --qlevel 255"
    output_directory="KTX2_ETC1S"
    suffix=""
else
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dir)
                shift
                output_directory="$1"
                ;;
            --suffix)
                shift
                suffix="-$1"
                ;;
            --encode)
                shift
                toktx_params="--encode $@"
                ;;
            *)
                shift
                ;;
        esac
    done
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
    file_extension="${file##*.}"

    # Root directory
    # echo "Root directory: $root_directory"

    # Substring of the root directory minus the full path
    substring="${file#$root_directory}"
	substring_without_extension="${substring%.*}"
	
	# Extract the directory path from the substring
    directory_path="$ktx2_directory$(dirname "$substring_without_extension")"

	if [ ! -d "$directory_path" ]; then
		mkdir -p "$directory_path"
		echo "Create directory: $directory_path"
	fi
	
	# Concatenate root directory, "KTX2", and substring
    new_path="$ktx2_directory$substring_without_extension$suffix.ktx2"
	echo "Encoding to KTX2..."

    # Check the file extension and set color format accordingly
    if [ "$file_extension" == "jpeg" ] || [ "$file_extension" == "jpg" ]; then
        color_format="--format R8G8B8_SRGB"
    else
        color_format="--format R8G8B8A8_SRGB"
    fi
	
	# Run ktx.exe for the current file
    # Info: https://github.khronos.org/KTX-Software/ktxtools/ktx_create.html
    echo "$script_directory/ktx.exe" create $toktx_params $color_format "$file" "$new_path"
    "$script_directory/ktx.exe" create $toktx_params $color_format "$file" "$new_path"
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