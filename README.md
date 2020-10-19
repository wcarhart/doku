<p align="center"><img alt="doku logo" src="logo.png" /></p>

<h1 align="center">doku</h1>
<h5 align="center">automated Sudoku solver</h5>

### Overview
Doku is an automated [Sudoku](https://en.wikipedia.org/wiki/Sudoku) solver for the command line.

### Documentation
Use `doku -h` or `doku --help` to view command line usage.
```
Usage: doku [-h] [-i] <input>

Required arguments:
  <input>  the path to the input file

Options:
  -h, --help           show this help menu and exit
  -i, --inputs         show hints on how to format input and exit
  -s, --show-original  show the original parsed board before solving
```
**[COMING SOON]** Please visit the [documentation site](https://willcarhart.dev/docs/doku) for full documentation.

### Install
Install with [Homebrew](https://brew.sh):
```bash
brew install wcarhart/tools/doku
```

Or, download or clone this repository and run:
```bash
./doku
```

### Examples
You can specify input via a JSON file or a more human-readable text format. See the [puzzles/](https://github.com/wcarhart/doku/tree/master/puzzles) folder for some examples.

For example, here is one possible input puzzle:
```
* * * | 5 * 6 | * * * 
* * 4 | * * * | 8 * * 
* 9 * | 1 * 2 | * 6 * 
---------------------
9 * 8 | * * * | 3 * 2 
* * * | * 9 * | * * * 
1 * 2 | * * * | 4 * 7 
---------------------
* 2 * | 3 * 4 | * 8 * 
* * 7 | * * * | 9 * * 
* * * | 9 * 5 | * * *
```
If this file was saved in `puzzle.txt`, you can solve it with:
```bash
doku puzzle.txt
```
Which would print:
```
2 8 1 | 5 4 6 | 7 3 9 
6 5 4 | 7 3 9 | 8 2 1 
7 9 3 | 1 8 2 | 5 6 4 
---------------------
9 7 8 | 4 6 1 | 3 5 2 
4 3 5 | 2 9 7 | 6 1 8 
1 6 2 | 8 5 3 | 4 9 7 
---------------------
5 2 9 | 3 7 4 | 1 8 6 
3 1 7 | 6 2 8 | 9 4 5 
8 4 6 | 9 1 5 | 2 7 3
```