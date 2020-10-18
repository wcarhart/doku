import { DokuBoard, DokuCell } from './core.js'

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

const constructBoard = async (data) => {
	// try to build data, either from JSON or human-readable format
	let json = null
	try {
		json = JSON.parse(data)
	} catch (e) {
		json = await constructDokuData(data)
		console.log(json)
	}

	// verify data was read
	if (json === null) {
		await showDataFormatHelp()
		Deno.exit(1)
	}

	// build new doku board
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
	for (let i = 0; i < 81; i++) {
		board.cells.push(new DokuCell({
			index: i,
			possibilities: [1, 2, 3, 4, 5, 6, 7, 8, 9]
		}))
	}
	for (let c of cells) {
		board.update(c, c.possibilities[0])
	}
	return board
}

const constructDokuData = async (data) => {
	// let lines = data.replace(' ', '').replace('|', '').replace('-', '').replace('?', '*').split('\n')
	let lines = []
	for (let l of data.split('\n')) {
		l = l.replaceAll(' ', '')
		l = l.replaceAll('|', '')
		l = l.replaceAll('-', '')
		l = l.replaceAll('?', '*')
		if (l === '') { continue }
		lines.push(l)
	}
	if (lines.length !== 9) {
		await showDataFormatHelp({extraHelp: 'too many lines in human-readable format'})
		Deno.exit(1)
	}
	let dokuData = []
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			console.log(data[row][col])
			if (data[row][col] === '*') {
				continue
			} else if (['1','2','3','4','5','6','7','8','9'].includes(data[row][col])) {
				dokuData.push({
					row: Number(row + 1),
					col: Number(col + 1),
					value: Number(data[row][col])
				})
			} else {
				await showDataFormatHelp({extraHelp: `invalid character '${data[row][col]}' found at row ${row+1}, column ${col+1}`})
				Deno.exit(1)
			}
		}
	}
	return dokuData
}

const showDataFormatHelp = async ({extraHelp='incorrect format'}) => {
	console.error(`Could not parse input data: ${extraHelp}`)
	console.error('')
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
	console.error('In the human-readable format, use \'*\' or \'?\' for unknown values. These characters will be ignored: \' \', \'|\', \'-\'')
}

const usage = async () => {
	console.log('doku - automated Sudoku solver')
	console.log('')
	console.log('Usage: doku <input>')
	console.log('')
	console.log('Required arguments:')
	console.log('  <input> the path to the input file')
}

const parseArgs = async (args) => {
	if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
		await usage()
		Deno.exit(0)
	}
	if (args.length !== 1) {
		console.error('duko: err: too many arguments')
		console.error('  use \'duko --help\' for usage')
		Deno.exit(1)
	}

	try {
		let fileInfo = await Deno.stat(args[0])
		if (!fileInfo.isFile) {
			console.error(`duko: no such file '${args[0]}'`)
			Deno.exit(1)
		}
	} catch (e) {
		console.error(`duko: cannot read file '${args[0]}'`)
		Deno.exit(1)
	}
	return await Deno.readTextFile(args[0])
}

const main = async () => {
	try {
		let data = await parseArgs(Deno.args)
		let board = await constructBoard(data)
		await board.print()
		board = await solve(board)
		await board.print()
	} catch (e) {
		console.error(e)
		Deno.exit(1)
	}
}

main()