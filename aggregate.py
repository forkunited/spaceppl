#!/usr/bin/python

import csv
import sys
from os import listdir
from os.path import isfile, join

input_file_dir = sys.argv[1]
input_file_type = sys.argv[2]
output_file_name = sys.argv[3]

def process_tsv_file(file_path):
    record = dict()
    f = open(file_path, 'rt')
    try:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            print row
    finally:
        f.close()


def process_messy_file(file_path):
    pass


def aggregate_directory(file_dir, file_type):
    files = [f for f in listdir(file_dir) if isfile(join(file_dir, f))]
    for file in files:
        process_tsv_file(join(file_dir, f))


aggregate_directory(input_file_dir, input_file_type)