#!/usr/bin/python

import csv
import sys
from scipy import stats
from random import randint

input_file = sys.argv[1]
output_file = sys.argv[2]
xlabel = sys.argv[3]
ylabel = sys.argv[4]
x = sys.argv[5]
y = sys.argv[6]
where = sys.argv[7].split(",")
where_values = sys.argv[8].split(",")
groupby = sys.argv[9].split(",")

def read_tsv_file(file_path):
    f = open(file_path, 'rt')
    rows = []
    try:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append(row)
    finally:
        f.close()
    return rows


def row_match(row, where, where_values):
    for i in range(len(where)):
        if row[where[i]] != where_values[i]:
            return false
    return true


# Map [groupby],x -> y value list filtered by 'where'
def aggregate(rows, x, y, where, where_values, groupby):
    agg = dict()
    for row in rows:
        if !row_match(row, where, where_values):
            continue
        cur_agg = agg
        for key in groupby:
            if row[key] not in cur_agg:
                cur_agg[row[key]] = dict()
            cur_agg = cur_agg[row[key]]
        x_value = row[x]
        y_value = row[y]
        if x_value not in cur_agg:
            cur_agg[x_value] = []
        cur_agg[x_value].append(float(y_value))
    return agg


def compute_statistics_helper(agg, agg_depth, keys, statistics, overall_statistics):
    if agg_depth == 0:
        cur_stats = statistics
        for key in keys:
            if key not in statistics:
                cur_stats[key] = dict()
            cur_stats = cur_stats[key]
        cur_stats["mu"] = stats.mean(agg)
        cur_stats["stderr"] = stats.sem(agg)
        overall_statistics["y_max"] = max(overall_statistics["y_max"], cur_stats["mu"])
        overall_statistics["x_max"] = max(overall_statistics["x_max"], float(keys[len(keys) - 1]))
    else:
        for key in agg:
            keys.append(key)
            compute_statistics_helper(agg[key], agg_depth - 1, keys, statistics, overall_statistics)
            keys.pop()
    return statistics, overall_statistics


def compute_statistics(agg, groupby):
    overall_statistics = dict()
    overall_statistics["y_max"] = 1.0
    overall_statistics["x_max"] = 0
    statistics = dict()
    return compute_statistics_helper(agg, len(groupby) + 1, [], statistics, overall_statistics)


def make_latex_plot_helper(statistics, groupby, depth, keys, str):
    if depth == 0:
        plot_str = "\addplot[color=black!" + randint(0,100) + ",dash pattern=on " + randint(1,3) + "pt off " + randint(1,3) + "px] coordinates {\n"

        for x_value in statistics:
            plot_str = plot_str + "(" + x_value + "," + statistics[x_value]["mu"] + ")+-(0.0," + statistics[x_value]["stderr"] + ")\n"

        plot_str = plot_str + "};\n"
        plot_str = plot_str + "\addlegendentry{\tiny{"
        for i in range(len(groupby)):
            plot_str = plot_str + groupby[i] + "=" + keys[i] + " "
        plot_str = plot_str + "}};\n\n"

        return plot_str
    else:
        for key in statistics:
            keys.append(key)
            str = str + make_latex_plot_helper(statistics[key], groupby, depth - 1, keys, str)
            keys.pop()
    return str


def make_latex_plot(statistics, overall_statistics, xlabel, ylabel, groupby):
    str = ("\begin{figure*}[ht]\n"
           "\begin{center}\n"
           "\begin{tikzpicture}\n"
           "\begin{axis}[%\n"
           "width=.5\textwidth,height=.5\textwidth,\n"
           "anchor=origin, % Shift the axis so its origin is at (0,0)\n"
           "ymin=0,ymax=" + overall_statistics["y_max"] + ",xmin=0,xmax=" + overall_statistics["x_max"] + ",%\n"
           "xlabel=" + xlabel + ",\n"
           "ylabel=" + ylabel + ",\n"
           "legend pos=outer north east\n"
           "]\n"
    )

    str = str + make_latex_plot_helper(statistics, groupby, len(groupby), [], "")

    str = str + ("\end{axis}\n"
                 "\end{tikzpicture}\n"
                 "\end{center}\n"
                 "\end{figure*}\n"
    )

    return str


rows = read_tsv_file(input_file)
agg = aggregate(rows, x, y, where, where_values, groupby)
statistics, overall_statistics = compute_statistics(agg, groupby)
print(make_latex_plot(statistics, overall_statistics, xlabel, ylabel, groupby))