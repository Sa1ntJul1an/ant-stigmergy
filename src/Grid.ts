import { Cell } from "./Cell";
import type { Coord } from "./types";

export const OBSTACLE = 1 << 0;
export const FOOD = 1 << 1;
export const ANT = 1 << 2;
export const NEST = 1 << 3;

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

  public getCell(coord: Coord): Cell {
    return new Cell(coord, this.cellStates[this.getIndex(coord.x, coord.y)], this.getPheromoneLevel(coord));
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
          for (const neighbor of this.getAllNeighbors(coord)) {
            if (neighbor.hasObstacle()) {
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

  public getNorthNeighbor(coord: Coord): Cell | null {
    if (coord.y >= this.rows - 1) {
      return null;
    }
    return this.getCell({x: coord.x, y: coord.y + 1});
  }

  public getEastNeighbor(coord: Coord): Cell | null {
    if (coord.x >= this.cols - 1) {
      return null;
    }
    return this.getCell({x: coord.x + 1, y: coord.y});
  }

  public getSouthNeighbor(coord: Coord): Cell | null {
    if (coord.y <= 0) {
      return null;
    }
    return this.getCell({x: coord.x, y: coord.y - 1});
  }

  public getWestNeighbor(coord: Coord): Cell | null {
    if (coord.x <= 0) {
      return null;
    }
    return this.getCell({x: coord.x - 1, y: coord.y});
  }
  
  public getNorthEastNeighbor(coord: Coord): Cell | null {
    if (coord.y >= this.rows - 1 || coord.x >= this.cols - 1) {
      return null;
    }
    return this.getCell({x: coord.x + 1, y: coord.y + 1});
  }

  public getSouthEastNeighbor(coord: Coord): Cell | null {
    if (coord.x >= this.cols - 1 || coord.y <= 0) {
      return null;
    }
    return this.getCell({x: coord.x + 1, y: coord.y - 1});
  }

  public getNorthWestNeighbor(coord: Coord): Cell | null {
    if (coord.x <= 0 || coord.y >= this.rows - 1) {
      return null;
    }
    return this.getCell({x: coord.x - 1, y: coord.y + 1});
  }

  public getSouthWestNeighbor(coord: Coord): Cell | null {
    if (coord.y <= 0 || coord.x <= 0) {
      return null;
    }
    return this.getCell({x: coord.x - 1, y: coord.y - 1});
  }

  private getAllNeighbors(coord: Coord): Cell[] {
    let cells: Cell[] = [];
   
    let neighbor = this.getNorthNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getEastNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getSouthNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getWestNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getNorthEastNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getSouthEastNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getNorthWestNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    neighbor = this.getSouthWestNeighbor(coord);
    if (neighbor !== null) {
      cells.push(neighbor);
    }
    return cells;
  }

  public step(): void {
    
  }
}
