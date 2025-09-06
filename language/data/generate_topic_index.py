#!/usr/bin/env python3
"""
Script to generate a topic_index.json file from all JSON files in the current directory.
The script reads all JSON files (except topic_index.json) and creates an index with
file information and empty descriptions.

usage:
cd <proper directory>
python generate_topic_index.py
"""

import json
import os
from datetime import datetime
from pathlib import Path


def generate_topic_index():
    """
    Generate a topic_index.json file from all JSON files in the current directory.
    Note: This completely rewrites the topic_index.json file from scratch.
    Any existing content will be replaced.
    """

    # Get the directory where this script is located
    script_dir = Path(__file__).parent

    # List to store file information
    topic_files = []

    # Check if topic_index.json already exists
    output_path = script_dir / 'topic_index.json'
    if output_path.exists():
        print("Note: Existing topic_index.json will be completely replaced.")

    # Find all JSON files in the current directory
    json_files = sorted([f for f in os.listdir(script_dir)
                         if f.endswith('.json') and f != 'topic_index.json'])

    print(f"Found {len(json_files)} JSON files to index")

    # Process each JSON file
    for filename in json_files:
        file_path = script_dir / filename

        # Get file information
        file_info = {
            "filename": filename,
            "description": "",  # Empty description as requested
            "file_size_bytes": os.path.getsize(file_path),
            "last_modified": datetime.fromtimestamp(
                os.path.getmtime(file_path)
            ).isoformat()
        }

        # Try to read the JSON file to get additional metadata
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

                # Add some basic metadata if available
                if isinstance(data, dict):
                    # Check for common metadata fields
                    if 'metadata' in data:
                        file_info['has_metadata'] = True
                    if 'total_entries' in data:
                        file_info['total_entries'] = data['total_entries']
                    elif 'entries' in data and isinstance(data['entries'], list):
                        file_info['total_entries'] = len(data['entries'])
                    elif 'total_pairs' in data:
                        file_info['total_entries'] = data['total_pairs']
                    elif isinstance(data, list):
                        file_info['total_entries'] = len(data)

                    # Add source file info if available
                    if 'metadata' in data and 'source_file' in data['metadata']:
                        file_info['source_file'] = data['metadata']['source_file']
                elif isinstance(data, list):
                    file_info['total_entries'] = len(data)

        except (json.JSONDecodeError, IOError) as e:
            print(f"  Warning: Could not read {filename}: {e}")
            file_info['read_error'] = str(e)

        topic_files.append(file_info)
        print(f"  - Added {filename}")

    # Create the topic index structure
    topic_index = {
        "generated_at": datetime.now().isoformat(),
        "generator_script": os.path.basename(__file__),
        "total_files": len(topic_files),
        "files": topic_files
    }

    # Write the topic_index.json file (completely overwrites any existing file)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(topic_index, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully regenerated topic_index.json with {len(topic_files)} files")
    print(f"Output saved to: {output_path}")

    # Print summary
    print("\nSummary of indexed files:")
    for file_info in topic_files:
        entries = file_info.get('total_entries', 'unknown')
        print(f"  - {file_info['filename']}: {entries} entries")

    return topic_index


def main():
    """Main function to run the script."""
    print("Topic Index Generator")
    print("=" * 50)
    print(f"Working directory: {Path.cwd()}")
    print(f"Script directory: {Path(__file__).parent}")
    print()

    try:
        generate_topic_index()
    except Exception as e:
        print(f"Error generating topic index: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
