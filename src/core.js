class DokuBoard {
	constructor(cells) {
		this.cells = cells
	}

	// get the cell at a specific row and column
	at(row, col) {
		return this.cells[DokuCell.calculateIndex(row, col)]
	}

	// update a specific cell's value and percolate updates
	update(cell, value) {
		let queue = []
		let newCell = new DokuCell({
			index: cell.index,
			possibilities: [value]
		})
		queue.push(newCell)
		this.cells[cell.index] = newCell
		while (queue.length !== 0) {
			let processing = queue.shift()
			if (processing.possibilities.length === 0) { break }

			for (let loc of ['row', 'col', 'subgrid']) {
				let results = this.percolate(processing, processing.possibilities[0], loc)
				queue = queue.concat(results)
			}
		}
	}

	// percolate updates through the board
	percolate(cell, value, loc) {
		let updatedCells = []
		switch (loc) {
			case 'row':
				for (let i = Math.floor(cell.index / 9) * 9; i < Math.floor(cell.index / 9) * 9 + 9; i++) {
					if (i === cell.index) { continue }
					let c = this.cells[i]
					if (c.possibilities.includes(value)) {
						let index = c.possibilities.indexOf(value)
						c.possibilities.splice(index, 1)
						if (c.possibilities.length === 1) {
							updatedCells.push(c)
						}
					}
				}
				break
			case 'col':
				for (let i = cell.index % 9; i < 81; i += 9) {
					if (i === cell.index) { continue }
					let c = this.cells[i]
					if (c.possibilities.includes(value)) {
						let index = c.possibilities.indexOf(value)
						c.possibilities.splice(index, 1)
						if (c.possibilities.length === 1) {
							updatedCells.push(c)
						}
					}
				}
				break
			case 'subgrid':
				let subgrid = DokuCell.calculateSubgrid(cell.index)
				for (let i = subgrid; i < subgrid + 3; i++) {
					for (let j = 0; j < 3 ; j++) {
						let index = j * 9 + i
						if (index === cell.index) { continue }
						let c = this.cells[index]
						if (c.possibilities.includes(value)) {
							let valueIndex = c.possibilities.indexOf(value)
							c.possibilities.splice(valueIndex, 1)
							if (c.possibilities.length === 1) {
								updatedCells.push(c)
							}
						}
					}
				}
				break
			default:
				console.error('Invalid location')
				Deno.exit(1)
		}
		return updatedCells
	}

	// get the next best move on the board
	determineNextMove() {
		let min = 9
		let moves = []
		for (let cell of this.cells) {
			if (cell.possibilities.length < min && cell.possibilities.length > 1) {
				min = cell.possibilities.length
			}
		}
		for (let cell of this.cells) {
			if (cell.possibilities.length === min) {
				moves.push(cell)
			}
		}
		return moves[Math.floor(Math.random() * moves.length)]
	}

	// true if the board is unsolvable
	isInconceivable() {
		for (let cell of this.cells) {
			if (cell.possibilities.length === 0) {
				return true
			}
		}
		return false
	}

	// true if the board is solved
	isSolution() {
		for (let cell of this.cells) {
			if (cell.possibilities.length !== 1) {
				return false
			}
		}
		return true
	}

	// make a copy of this board for processing
	duplicate() {
		let cells = []
		for (let cell of this.cells) {
			cells.push(cell.duplicate())
		}
		return new DokuBoard(cells)
	}

	// print the board to the command line
	async print() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let index = i * 9 + j
				let value = '*'
				if (this.cells[index].possibilities.length === 0) {
					value = '!'
				} else if (this.cells[index].possibilities.length === 1) {
					value = `${this.cells[index].possibilities[0]}`
				}
				if (j % 3 === 2 && j !== 8) {
					value += ' |'
				}
				await Deno.writeAll(Deno.stdout, new TextEncoder().encode(`${value} `))
			}
			if (i % 3 == 2 && i !== 8) {
				console.log('\n---------------------')
			} else {
				console.log('')
			}
		}
	}

	printSync() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let index = i * 9 + j
				let value = '*'
				if (this.cells[index].possibilities.length === 0) {
					value = '!'
				} else if (this.cells[index].possibilities.length === 1) {
					value = `${this.cells[index].possibilities[0]}`
				}
				if (j % 3 === 2 && j !== 8) {
					value += ' |'
				}
				Deno.writeAllSync(Deno.stdout, new TextEncoder().encode(`${value} `))
			}
			if (i % 3 == 2 && i !== 8) {
				console.log('\n---------------------')
			} else {
				console.log('')
			}
		}
	}
}

class DokuCell {
	constructor({index=null, possibilities=null}) {
		this.index = index
		this.possibilities = possibilities
	}

	// convert (row, col) --> index
	static calculateIndex(row, col) {
		return (row - 1) * 9 + (col - 1)
	}

	// find the corresponding subgrid for a cell
	static calculateSubgrid(index) {
		let col = index % 9
		let row = Math.floor(index / 9)
		switch (row) {
			case 0: case 1: case 2:
				if (col >= 0 && col < 3) { return 0 }
				if (col >= 3 && col < 6) { return 3 }
				return 6
			case 3: case 4: case 5:
				if (col >= 0 && col < 3) { return 27 }
				if (col >= 3 && col < 6) { return 30 }
				return 33
			case 6: case 7: case 8:
				if (col >= 0 && col < 3) { return 54 }
				if (col >= 3 && col < 6) { return 57 }
				return 60
			default:
				console.error('Invalid subgrid index')
				Deno.exit(1)
		}
	}

	duplicate() {
		return new DokuCell({index: this.index, possibilities: [...this.possibilities]})
	}
}

export {
	DokuBoard,
	DokuCell
}