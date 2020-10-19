import { DokuBoard, DokuCell } from './core.js'

let SHOW_ORIGINAL = false

// solve a given doku board
const solve = async (board) => {
	// if board is inconceivable, abort this path in the tree
	if (board.isInconceivable()) {
		return null
	}

	// if this board is solved, we are done (return it)
	if (board.isSolution()) {
		return board
	}

	// dive into each possible branch
	let copy = null, solution = null
	let cell = board.determineNextMove()
	for (let possibility of cell.possibilities) {
		copy = board.duplicate()
		copy.update(cell, possibility)
		solution = await solve(copy)
		if (solution !== null) {
			return solution
		}
	}

	// if we can't solve the board, it is inconceivable
	return null
}

// construct a new doku board based on input data
const constructBoard = async (data) => {
	// parse input data
	let json = null
	try {
		json = JSON.parse(data)
	} catch (e) {
		json = await constructDokuData(data)
	}

	// confirm input data is valid
	if (json === null) {
		await showDataFormatHelp()
		Deno.exit(1)
	}

	// build new board
	try {
		// parse known cells
		let board = new DokuBoard([])
		let cells = []
		for (let [index, item] of json.entries()) {
			if (item.row === null || item.row === undefined) { console.error(`Missing 'row' property in input data ${index}`) ; Deno.exit(1) }
			if (item.col === null || item.col === undefined) { console.error(`Missing 'col' property in input data ${index}`) ; Deno.exit(1) }
			if (item.value === null || item.value === undefined) { console.error(`Missing 'value' property in input data ${index}`) ; Deno.exit(1) }
			cells.push(new DokuCell({
				index: DokuCell.calculateIndex(item.row, item.col),
				possibilities: [item.value]
			}))
		}

		// create all 81 cells
		for (let i = 0; i < 81; i++) {
			board.cells.push(new DokuCell({
				index: i,
				possibilities: [1, 2, 3, 4, 5, 6, 7, 8, 9]
			}))
		}

		// update values based on known cells
		for (let c of cells) {
			board.update(c, c.possibilities[0])
		}
		return board
	} catch (e) {
		console.error(e)
		Deno.exit(1)
	}
}

// convert human readable board into JSON
const constructDokuData = async (data) => {
	// clean up input data into parsable format
    let lines = data.replaceAll(' ', '').replaceAll('|', '').replaceAll('-', '').replaceAll('?', '*').split('\n')
    lines = lines.filter(line => line !== '')
    if (lines.length < 9) {
        await showDataFormatHelp({extraHelp: 'too few lines in human-readable format'})
        Deno.exit(1)
    } else if (lines.length > 9) {
    	await showDataFormatHelp({extraHelp: 'too many lines in human-readable format'})
        Deno.exit(1)
    }

    // convert human readable format to JSON
    let dokuData = []
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (lines[row][col] === '*') {
                continue
            } else if (['1','2','3','4','5','6','7','8','9'].includes(lines[row][col])) {
                dokuData.push({
                    row: Number(row + 1),
                    col: Number(col + 1),
                    value: Number(lines[row][col])
                })
            } else {
                await showDataFormatHelp({extraHelp: `invalid character '${lines[row][col]}' found at row ${row+1}, column ${col+1}`})
                Deno.exit(1)
            }
        }
    }
    return dokuData
}

// show help for when input data cannot be parsed
const showDataFormatHelp = async ({extraHelp='incorrect format', error=true}) => {
	if (error) {
		console.error(`Could not parse input data: ${extraHelp}`)
		console.error('')
	}
	console.error('Input data can either be a JSON array that lists the row, column, and value of known cells in the board:')
	console.error('  [ { "row": 1, "col": 4, "value": 5 }, { "row": 6, "col": 7, "value": 4 }, ... ]')
	console.error('')
	console.error('Or, it can be a human-readable 9x9 grid of numbers:')
	console.error('  * * * | 5 * 6 | * * * ')
	console.error('  * * 4 | * * * | 8 * * ')
	console.error('  * 9 * | 1 * 2 | * 6 * ')
	console.error('  --------------------- ')
	console.error('  9 * 8 | * * * | 3 * 2 ')
	console.error('  * * * | * 9 * | * * * ')
	console.error('  1 * 2 | * * * | 4 * 7 ')
	console.error('  --------------------- ')
	console.error('  * 2 * | 3 * 4 | * 8 * ')
	console.error('  * * 7 | * * * | 9 * * ')
	console.error('  * * * | 9 * 5 | * * * ')
	console.error('')
	console.error('For human-readable format, use \'*\' or \'?\' for unknown values. These characters will be ignored: \' \', \'|\', \'-\'')
}

// show CLI usage
const usage = async () => {
	console.log('doku - automated Sudoku solver')
	console.log('')
	console.log('Usage: doku [-h] [-i] <input>')
	console.log('')
	console.log('Required arguments:')
	console.log('  <input>  the path to the input file')
	console.log('')
	console.log('Options:')
	console.log('  -h, --help           show this help menu and exit')
	console.log('  -i, --inputs         show hints on how to format input and exit')
	console.log('  -s, --show-original  show the original parsed board before solving')
}

// parse command line arguments
const parseArgs = async (cla) => {
	// make copy of args for processing
	let args = [...cla]

	// show help
	if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
		await usage()
		Deno.exit(0)
	}

	// show input help
	if (args.includes('-i') || args.includes('--inputs')) {
		await showDataFormatHelp({error: false})
		Deno.exit(0)
	}

	// configure show original
	if (args.includes('-s') || args.includes('--show-original')) {
		SHOW_ORIGINAL = true
		if (args.includes('-s')) {
			args.splice(args.indexOf('-s'), 1)
		} else {
			args.splice(args.indexOf('--show-original'), 1)
		}
	}

	// there should only be one command line argument: the input file
	if (args.length !== 1) {
		console.error('doku: too many arguments')
		console.error('  use \'doku --help\' for usage and \'doku --inputs\' for input guidance')
		Deno.exit(1)
	}

	// validate input file
	try {
		let fileInfo = await Deno.stat(args[0])
		if (!fileInfo.isFile) {
			console.error(`doku: no such file '${args[0]}'`)
			Deno.exit(1)
		}
	} catch (e) {
		console.error(`doku: cannot read file '${args[0]}'`)
		Deno.exit(1)
	}

	// return contents of validated file
	return await Deno.readTextFile(args[0])
}

// run doku
const main = async () => {
	try {

		// parse arguments
		let data = await parseArgs(Deno.args)

		// construct new board with known cells
		let board = await constructBoard(data)
		if (SHOW_ORIGINAL) {
			await board.print()
			console.log('')
		}

		// solve the board
		board = await solve(board)

		// report results
		if (board !== null) {
			await board.print()
		} else {
			console.log('Board is not solvable')
			Deno.exit(1)
		}
	} catch (e) {
		console.error(e)
		Deno.exit(1)
	}
}

main()