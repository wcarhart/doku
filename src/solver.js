import { DokuBoard, DokuCell } from './core.js'

const solve = async (board) => {
	await board.print()
	console.log('============================================================')

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
	// cell = new DokuCell({ index: 9, possibilities: [ 6, 5 ] })
	console.log(cell)
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
	try {
		let board = new DokuBoard([])
		let json = JSON.parse(data)
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
	} catch (e) {
		console.error(e)
		Deno.exit(1)
	}
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
	// let difficulty = 1
	try {
		let data = await parseArgs(Deno.args)
		let board = await constructBoard(data)
		board = await solve(board)
		await board.print()
	} catch (e) {
		console.error(e)
		Deno.exit(1)
	}
}

main()