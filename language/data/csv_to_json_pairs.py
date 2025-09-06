#!/usr/bin/env python3
"""
CSV to JSON converter for files containing exactly pairs (2 columns).
This script reads a CSV file where each row contains exactly 2 values
and converts it to a JSON format.
"""

import csv
import json
import sys
import os


def csv_to_json_pairs(csv_file_path, json_file_path=None):
    """
    Convert a CSV file with pairs to JSON format.

    Args:
        csv_file_path: Path to the input CSV file
        json_file_path: Path to the output JSON file (optional)
                       If not provided, uses the CSV filename with .json extension

    Returns:
        The converted data as a Python dictionary
    """

    if not os.path.exists(csv_file_path):
        print(f"Error: File '{csv_file_path}' not found.")
        sys.exit(1)

    # Determine output file path
    if json_file_path is None:
        base_name = os.path.splitext(csv_file_path)[0]
        json_file_path = f"{base_name}.json"

    pairs_data = []
    invalid_rows = []

    try:
        # Read CSV file
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')

            for row_num, row in enumerate(csv_reader, start=1):
                # Skip empty rows
                if not row:
                    continue

                # Clean up whitespace from each element
                row = [item.strip() for item in row if item.strip()]

                # Check if the row has exactly 2 elements
                if len(row) == 2:
                    pairs_data.append({
                        "id": row_num,
                        "term1": row[0],
                        "term2": row[1]
                    })
                else:
                    invalid_rows.append({
                        "row_number": row_num,
                        "content": row,
                        "element_count": len(row)
                    })

        # Create the final JSON structure
        json_data = {
            "total_pairs": len(pairs_data),
            "pairs": pairs_data
        }

        # Add invalid rows information if any
        if invalid_rows:
            json_data["invalid_rows"] = {
                "count": len(invalid_rows),
                "details": invalid_rows
            }
            print(f"Warning: Found {len(invalid_rows)} rows that don't contain exactly 2 elements.")
            print("These rows have been recorded in the 'invalid_rows' section of the JSON output.")

        # Write to JSON file
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, ensure_ascii=False, indent=2)

        print(f"Successfully converted '{csv_file_path}' to '{json_file_path}'")
        print(f"Total valid pairs: {len(pairs_data)}")
        if invalid_rows:
            print(f"Invalid rows (not pairs): {len(invalid_rows)}")

        return json_data

    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)


def main():
    """Main function to handle command line arguments."""

    if len(sys.argv) < 2:
        print("Usage: python csv_to_json_pairs.py <csv_file> [json_output_file]")
        print("\nDescription:")
        print("  Converts a CSV file containing pairs (exactly 2 columns) to JSON format.")
        print("\nArguments:")
        print("  csv_file         - Path to the input CSV file")
        print("  json_output_file - (Optional) Path to the output JSON file")
        print("                     If not provided, uses <csv_filename>_pairs.json")
        print("\nExample:")
        print("  python csv_to_json_pairs.py data.csv")
        print("  python csv_to_json_pairs.py data.csv output.json")
        sys.exit(1)

    csv_file = sys.argv[1]
    json_file = sys.argv[2] if len(sys.argv) > 2 else None

    csv_to_json_pairs(csv_file, json_file)


if __name__ == "__main__":
    main()
