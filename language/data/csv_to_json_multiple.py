#!/usr/bin/env python3
"""
CSV to JSON converter for files containing 2 or more alternatives in each line.
This script reads a CSV file where each row can contain any number of values (2 or more)
and converts it to a JSON format with all alternatives grouped together.
"""

import csv
import json
import sys
import os


def csv_to_json_multiple(csv_file_path, json_file_path=None, min_alternatives=2):
    """
    Convert a CSV file with multiple alternatives to JSON format.

    Args:
        csv_file_path: Path to the input CSV file
        json_file_path: Path to the output JSON file (optional)
                       If not provided, uses the CSV filename with .json extension
        min_alternatives: Minimum number of alternatives required (default: 2)

    Returns:
        The converted data as a Python dictionary
    """

    if not os.path.exists(csv_file_path):
        print(f"Error: File '{csv_file_path}' not found.")
        sys.exit(1)

    # Determine output file path
    if json_file_path is None:
        base_name = os.path.splitext(csv_file_path)[0]
        json_file_path = f"{base_name}_multiple.json"

    synonyms_data = []
    invalid_rows = []
    statistics = {
        "min_alternatives": float('inf'),
        "max_alternatives": 0,
        "total_alternatives": 0,
        "alternative_counts": {}
    }

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

                # Check if the row has at least the minimum required alternatives
                if len(row) >= min_alternatives:
                    synonym_entry = {
                        "id": row_num,
                        "alternatives_count": len(row),
                        "alternatives": row
                    }
                    synonyms_data.append(synonym_entry)

                    # Update statistics
                    alt_count = len(row)
                    statistics["min_alternatives"] = min(statistics["min_alternatives"], alt_count)
                    statistics["max_alternatives"] = max(statistics["max_alternatives"], alt_count)
                    statistics["total_alternatives"] += alt_count

                    # Track frequency of different alternative counts
                    if alt_count not in statistics["alternative_counts"]:
                        statistics["alternative_counts"][alt_count] = 0
                    statistics["alternative_counts"][alt_count] += 1

                elif len(row) > 0:  # Has content but less than minimum required
                    invalid_rows.append({
                        "row_number": row_num,
                        "content": row,
                        "element_count": len(row),
                        "reason": f"Less than {min_alternatives} alternatives"
                    })

        # Calculate average alternatives per row
        if synonyms_data:
            statistics["average_alternatives"] = round(
                statistics["total_alternatives"] / len(synonyms_data), 2
            )
        else:
            statistics["min_alternatives"] = 0
            statistics["average_alternatives"] = 0

        # Sort alternative_counts dictionary by key for better readability
        statistics["alternative_counts"] = dict(
            sorted(statistics["alternative_counts"].items())
        )

        # Create the final JSON structure
        json_data = {
            "metadata": {
                "source_file": os.path.basename(csv_file_path),
                "total_entries": len(synonyms_data),
                "minimum_alternatives_required": min_alternatives
            },
            "statistics": statistics,
            "entries": synonyms_data
        }

        # Add invalid rows information if any
        if invalid_rows:
            json_data["invalid_rows"] = {
                "count": len(invalid_rows),
                "details": invalid_rows
            }
            print(f"Warning: Found {len(invalid_rows)} rows with less than {min_alternatives} elements.")
            print("These rows have been recorded in the 'invalid_rows' section of the JSON output.")

        # Write to JSON file
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, ensure_ascii=False, indent=2)

        print(f"Successfully converted '{csv_file_path}' to '{json_file_path}'")
        print(f"Total entries: {len(synonyms_data)}")
        print(f"Alternative counts: min={statistics['min_alternatives']}, "
              f"max={statistics['max_alternatives']}, "
              f"avg={statistics.get('average_alternatives', 0)}")
        if invalid_rows:
            print(f"Invalid rows (less than {min_alternatives} alternatives): {len(invalid_rows)}")

        return json_data

    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)


def analyze_csv(csv_file_path):
    """
    Analyze a CSV file to show distribution of alternatives per row.
    This helps users understand their data before conversion.
    """

    if not os.path.exists(csv_file_path):
        print(f"Error: File '{csv_file_path}' not found.")
        return

    distribution = {}
    total_rows = 0

    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')

            for row in csv_reader:
                # Clean up whitespace from each element
                row = [item.strip() for item in row if item.strip()]
                if row:
                    total_rows += 1
                    count = len(row)
                    if count not in distribution:
                        distribution[count] = 0
                    distribution[count] += 1

        print(f"\nAnalysis of '{csv_file_path}':")
        print(f"Total non-empty rows: {total_rows}")
        print("\nDistribution of alternatives per row:")
        for count in sorted(distribution.keys()):
            percentage = (distribution[count] / total_rows) * 100
            print(f"  {count} alternatives: {distribution[count]} rows ({percentage:.1f}%)")

    except Exception as e:
        print(f"Error analyzing file: {e}")


def main():
    """Main function to handle command line arguments."""

    if len(sys.argv) < 2:
        print("Usage: python csv_to_json_multiple.py <csv_file> [json_output_file] [--min-alternatives N] [--analyze]")
        print("\nDescription:")
        print("  Converts a CSV file containing 2 or more alternatives per row to JSON format.")
        print("\nArguments:")
        print("  csv_file            - Path to the input CSV file")
        print("  json_output_file    - (Optional) Path to the output JSON file")
        print("                        If not provided, uses <csv_filename>_multiple.json")
        print("\nOptions:")
        print("  --min-alternatives N - Minimum number of alternatives required per row (default: 2)")
        print("  --analyze           - Analyze the CSV file to show distribution of alternatives")
        print("\nExamples:")
        print("  python csv_to_json_multiple.py synonims.csv")
        print("  python csv_to_json_multiple.py synonims.csv output.json")
        print("  python csv_to_json_multiple.py synonims.csv --min-alternatives 3")
        print("  python csv_to_json_multiple.py synonims.csv --analyze")
        sys.exit(1)

    csv_file = sys.argv[1]
    json_file = None
    min_alternatives = 2
    analyze_only = False

    # Parse additional arguments
    i = 2
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--min-alternatives" and i + 1 < len(sys.argv):
            try:
                min_alternatives = int(sys.argv[i + 1])
                if min_alternatives < 1:
                    print("Error: Minimum alternatives must be at least 1")
                    sys.exit(1)
                i += 2
            except ValueError:
                print(f"Error: Invalid number for --min-alternatives: {sys.argv[i + 1]}")
                sys.exit(1)
        elif arg == "--analyze":
            analyze_only = True
            i += 1
        elif not arg.startswith("--"):
            json_file = arg
            i += 1
        else:
            print(f"Unknown option: {arg}")
            sys.exit(1)

    if analyze_only:
        analyze_csv(csv_file)
    else:
        csv_to_json_multiple(csv_file, json_file, min_alternatives)


if __name__ == "__main__":
    main()
