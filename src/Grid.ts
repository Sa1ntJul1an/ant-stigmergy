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
    let coord = {x: 0, y: 0}
    for (let i = 0; i < this.obstacleSmoothingSteps; i++) {
      let nextCellStates = new Uint8Array(this.rows * this.cols).fill(0);
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          let neighboringObstacles = 0;
          coord = {x: c, y: r};
          for (const neighborState of this.getAllNeighbors(coord)) {
            if (neighborState & OBSTACLE) {
              neighboringObstacles++;
            }
          }

          if (neighboringObstacles >= 4 || this.getAllNeighbors(coord).length < 8) {
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

  private getAllNeighbors(coord: Coord): CellState[] {
    let neighborStates: CellState[] = [];
   
    let neighborState = this.getNorthNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getEastNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getSouthNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getWestNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getNorthEastNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getSouthEastNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getNorthWestNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    neighborState = this.getSouthWestNeighbor(coord.x, coord.y);
    if (neighborState !== null) {
      neighborStates.push(neighborState);
    }
    return neighborStates;
  }

  public step(): void {
    
  }
}
