import argparse
import pathlib
import csv
import json

parser = argparse.ArgumentParser(
    description="Converts a CSV file to JSON. Output will be in the same directory as input."
)

parser.add_argument('file', help='Path to csv file')
parser.add_argument('--output', '-o', help='Output location')

args = parser.parse_args()

path = pathlib.Path(args.file)

if not path.exists():
    print("Path does not exist")
    exit(1)

if path.is_dir():
    print("Path is a directory")
    exit(1)

if path.suffix != '.csv':
    print("File extension is not .csv")

if args.output is None:

    out_dir = path.parent  # type: pathlib.Path
    out_path = out_dir.joinpath(path.stem + '.json')

else:
    out_path = pathlib.Path(args.output)

items = []

with open(path, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        items.append(row)


with out_path.open('w') as f:
    json.dump(items, f)
