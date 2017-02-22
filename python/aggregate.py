#!/usr/bin/python

import csv
import sys
from os import listdir
from os.path import isfile, join
from collections import OrderedDict

input_file_dir = sys.argv[1]
input_file_type = sys.argv[2]
output_file_path = sys.argv[3]
tsv_line_start = None
if input_file_type == "MESSY_TSV":
    tsv_line_start = sys.argv[4]

def process_tsv_file(file_path):
    f = open(file_path, 'rt')
    rows = []
    try:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append(row)
    finally:
        f.close()
    return rows

def process_messy_tsv_file(file_path):
    records = []
    tsv_started = False
    f = open(file_path, 'rt')

    try:
        keys = []
        for line in f:
            if tsv_started:
                cur_record = dict()
                values = line.split("\t")
                for i in range(len(values)):
                    cur_record[keys[i].strip()] = values[i].strip()
                records.append(cur_record)
            elif line.startswith(tsv_line_start):
                tsv_started = true
                keys = line.split("\t")
    finally:
        f.close()
    return records

def process_messy_file(file_path):
    record = dict()
    f = open(file_path, 'rt')
    cur_prefix = ""
    cur_state = 0
    try:
        for line in f:
            if line.startswith("seed"):
                record["seed"] = line.split("\t")[1].strip()
            elif line.startswith("training dist"):
                record["dist"] = line.split("\t")[1].strip()
            elif line.startswith("iterations"):
                record["iterations"] = line.split("\t")[1].strip()
            elif line.startswith("samples"):
                record["samples"] = line.split("\t")[1].strip()
            elif line.startswith("worldPriorCount"):
                record["priors"] = line.split("\t")[1].strip()
            elif line.startswith("Default") or line.startswith("Translated") or line.startswith("Scaled") or line.startswith("Rotated"):
                cur_prefix = line.strip()
                cur_state = 1
            elif cur_state == 1:
                cur_state = cur_state + 1
            elif cur_state > 1:
                line_parts = line.split("\t")
                level = line_parts[1].strip()
                accL = line_parts[2].strip()
                accS = line_parts[3].strip()
                
                record["L" + level + " " + cur_prefix + " Evaluation"] = accL
                record["S" + level + " " + cur_prefix + " Evaluation"] = accS
                if cur_state == 5:
                    cur_state = 0
                else:
                    cur_state = cur_state + 1
    finally:
        f.close()
    return [record]

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
        if file_type == 'MESSY':
            rows.extend(process_messy_file(join(file_dir, file)))
        elif file_type == 'MESSY_TSV':
            rows.extend(process_messy_tsv_file(join(file_dir,file)))
        else:
            rows.extend(process_tsv_file(join(file_dir, file)))
    return rows

output_tsv(output_file_path, aggregate_directory(input_file_dir, input_file_type))
