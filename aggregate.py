#!/usr/bin/python

import csv
import sys
from os import listdir
from os.path import isfile, join
from collections import OrderedDict

input_file_dir = sys.argv[1]
input_file_type = sys.argv[2]
output_file_path = sys.argv[3]

def process_tsv_file(file_path):
    record = dict()
    f = open(file_path, 'rt')
    rows = []
    try:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append(row)
    finally:
        f.close()
    return row


def process_messy_file(file_path):
    pass

def output_tsv(file_path, rows):
    fields = OrderedDict([(k, None) for k in rows[0].keys()])
    f = open(file_path, 'wb')
    try:
        writer = csv.DictWriter(f, delimiter='\t', fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    finally:
        f.close()

def aggregate_directory(file_dir, file_type):
    files = [f for f in listdir(file_dir) if isfile(join(file_dir, f))]
    rows = []
    for file in files:
        if file_type == 'MESSY'
            rows.extend(process_messy_file(join(file_dir, file)))
        else
            rows.extend(process_tsv_file(join(file_dir, file)))
    return rows

output_tsv(output_file_path, aggregate_directory(input_file_dir, input_file_type))
