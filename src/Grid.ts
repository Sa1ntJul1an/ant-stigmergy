import type { Coord } from "./types";

export const OBSTACLE = 1 << 0;
export const FOOD = 1 << 1;
export const ANT = 1 << 2;
export const NEST = 1 << 3;

type CellState = number;

export class Grid {

  public cellStates: Uint8Array;
  private pheromoneGrid: Uint8Array;

  // private nextPheromoneGrid: Uint8Array;

  private obstacleSmoothingSteps: number;

  constructor(public rows: number, public cols: number) {
    this.cellStates = new Uint8Array(rows * cols).fill(0);

    this.pheromoneGrid = new Uint8Array(rows * cols).fill(0);

    // this.nextPheromoneGrid = new Uint8Array(rows * cols).fill(0);
    
    this.obstacleSmoothingSteps = 10;
  }

  private clearObstacles(): void {
    // this.obstacleGrid.fill(0);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cellStates[this.getIndex(c, r)] &= ~OBSTACLE;
      }
    }
  }

  // map (x, y) to 1D index 
  public getIndex(x: number, y: number): number {
    return y * this.cols + x;
  }

  public setNest(x: number, y: number) {
    console.log(`setting nest at (${x}, ${y})`);
    for (let x_offset = -1; x_offset <= 1; x_offset++) {
      for (let y_offset = -1; y_offset <= 1; y_offset++) {
        this.cellStates[this.getIndex(x + x_offset, y + y_offset)] |= NEST;
      }
    }
  }

  private getPheromoneLevel(coord: Coord): number {
    return this.pheromoneGrid[this.getIndex(coord.x, coord.y)];
  }

  public initObstacles(): void {
    console.log("initializing obstacles")
    this.clearObstacles();
    // seed static noise map of obstacles
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (Math.random() > 0.68) {
          this.cellStates[this.getIndex(c, r)] |= OBSTACLE;
        }
      }
    }

    // run smoothing steps for obstacle map using Conway's Game of Life rules 
    for (let i = 0; i < this.obstacleSmoothingSteps; i++) {
      let nextCellStates = new Uint8Array(this.rows * this.cols).fill(0);
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          let neighboringObstacles = 0;
          for (const neighborState of this.getAllNeighbors(c, r)) {
            if (neighborState & OBSTACLE) {
              neighboringObstacles++;
            }
          }

          if (neighboringObstacles >= 4 || this.getAllNeighbors(c, r).length < 8) {
            nextCellStates[this.getIndex(c, r)] |= OBSTACLE;
            
          } else {
            nextCellStates[this.getIndex(c, r)] &= ~OBSTACLE;
          }
        }
      }
      this.cellStates.set(nextCellStates);
    }
  }

  public getNorthNeighbor(x: number, y: number): CellState | null {
    if (y >= this.rows - 1) {
      return null;
    }
    return this.cellStates[this.getIndex(x, y + 1)];
  }

  public getEastNeighbor(x: number, y: number): CellState | null {
    if (x >= this.cols - 1) {
      return null;
    }
    return this.cellStates[this.getIndex(x + 1, y)];
  }

  public getSouthNeighbor(x: number, y: number): CellState | null {
    if (y <= 0) {
      return null;
    }
    return this.cellStates[this.getIndex(x, y - 1)];
  }

  public getWestNeighbor(x: number, y: number): CellState | null {
    if (x <= 0) {
      return null;
    }
    return this.cellStates[this.getIndex(x - 1, y)];
  }
  
  public getNorthEastNeighbor(x: number, y: number): CellState | null {
    if (y >= this.rows - 1 || x >= this.cols - 1) {
      return null;
    }
    return this.cellStates[this.getIndex(x + 1, y + 1)];
  }

  public getSouthEastNeighbor(x: number, y: number): CellState | null {
    if (x >= this.cols - 1 || y <= 0) {
      return null;
    }
    return this.cellStates[this.getIndex(x + 1, y - 1)];
  }

  public getNorthWestNeighbor(x: number, y: number): CellState | null {
    if (x <= 0 || y >= this.rows - 1) {
      return null;
    }
    return this.cellStates[this.getIndex(x - 1, y + 1)];
  }

  public getSouthWestNeighbor(x: number, y: number): CellState | null {
    if (y <= 0 || x <= 0) {
      return null;
    }
    return this.cellStates[this.getIndex(x - 1, y - 1)];
  }

  private getAllNeighbors(x: number, y: number): CellState[] {
    let neighborStates: CellState[] = [];
   
    let neighborState = this.getNorthNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getEastNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getSouthNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getWestNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getNorthEastNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getSouthEastNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getNorthWestNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getSouthWestNeighbor(x, y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    return neighborStates;
  }

  public step(): void {
    
  }
}
