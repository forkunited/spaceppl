#!/usr/bin/python

import csv
import sys
import json

document_groupby = sys.argv[1]
record_groupby = sys.argv[2]
annotation_field = sys.argv[3]
input_files = sys.argv[4].split(",")
input_file_types = sys.argv[5].split(",")
output_dir = sys.argv[6]

def process_csv_files():
    D = dict()
    for i in range(len(input_files)):
        process_csv_file(input_files[i], D, input_file_types[i])
    return D


def process_csv_file(file_path, D, file_type):
    f = open(file_path, 'rt')
    try:
        reader = csv.DictReader(f, delimiter=',')
        for record in reader:
            process_record(record, D, file_type)
    finally:
        f.close()
    return D


def process_record(record, D, record_type):
    D_sub = D
    if record[document_groupby] not in D_sub:
        D_sub[record[document_groupby]] = dict()
    D_sub = D_sub[record[document_groupby]]

    if record[record_groupby] not in D_sub:
        D_sub[record[record_groupby]] = []
    D_sub = D_sub[record[record_groupby]]

    sub_record = dict()
    for key in record:
        if key != document_groupby and key != record_groupby:
            if key == "time":
                sub_record[key] = int(record[key])
            else:
                sub_record[key] = record[key]
    sub_record["type"] = record_type
    annotate_record(sub_record)
    D_sub.append(sub_record)


def annotate_record(record):
    pass


def output_record_files(D):
    for key in D:
        records = D[key]
        record_keys = [str(ikey) for ikey in sorted([int(rkey) for rkey in records.keys()])]
        records_list = []
        for record_key in record_keys: # A record key is usually the number for a round
            record = dict()
            record[record_groupby] = int(record_key)
            record["events"] = sorted(records[record_key], key=lambda x: x["time"])
            records_list.append(record)
        document_obj = dict()
        document_obj[document_groupby] = key
        document_obj["records"] = records_list
        print json.dumps(document_obj)

output_record_files(process_csv_files())

################
# On output remember to sort by time
#def output_tsv(file_path, rows):
#    fields = OrderedDict([(k, None) for k in rows[0].keys()])
#    f = open(file_path, 'wb')
#    try:
#        writer = csv.DictWriter(f, delimiter='\t', fieldnames=fields)
#        writer.writeheader()
#        for row in rows:
#            writer.writerow(row)
#    finally:
#        f.close()
#
#def aggregate_directory(file_dir, file_type):
#    files = [f for f in listdir(file_dir) if isfile(join(file_dir, f))]
#    rows = []
#    for file in files:
#       if file_type == 'MESSY':
#            rows.extend(process_messy_file(join(file_dir, file)))
#        else:
#            rows.extend(process_tsv_file(join(file_dir, file)))
#    return rows

#output_tsv(output_file_path, aggregate_directory(input_file_dir, input_file_type))
