import { Cell } from "./Cell";
import type { Coord } from "./types";

export class Grid {
  private antGrid: Uint8Array;
  private foodGrid: Uint8Array;
  private obstacleGrid: Uint8Array;
  private pheromoneGrid: Uint8Array;

  private nextAntGrid: Uint8Array;
  private nextFoodGrid: Uint8Array;
  private nextObstacleGrid: Uint8Array;
  private nextPheromoneGrid: Uint8Array;

  private obstacleSmoothingSteps: number;

  constructor(public rows: number, public cols: number) {
    this.antGrid = new Uint8Array(rows * cols).fill(0);
    this.pheromoneGrid = new Uint8Array(rows * cols).fill(0);
    this.foodGrid = new Uint8Array(rows * cols).fill(0);
    this.obstacleGrid = new Uint8Array(rows * cols).fill(0);
    
    this.nextAntGrid = new Uint8Array(rows * cols).fill(0);
    this.nextFoodGrid = new Uint8Array(rows * cols).fill(0);
    this.nextObstacleGrid = new Uint8Array(rows * cols).fill(0);
    this.nextPheromoneGrid = new Uint8Array(rows * cols).fill(0);
    
    this.obstacleSmoothingSteps = 10;
  }

  // map (x, y) to 1D index 
  private getIndex(coord: Coord): number {
    return coord.y * this.cols + coord.x;
  }

  private hasAnt(coord: Coord): boolean {
    return this.antGrid[this.getIndex(coord)] > 0;
  }
  
  private hasFood(coord: Coord): boolean {
    return this.foodGrid[this.getIndex(coord)] > 0;
  }
  
  private hasObstacle(coord: Coord): boolean {
    return this.obstacleGrid[this.getIndex(coord)] > 0;
  }

  private getPheromoneLevel(coord: Coord): number {
    return this.pheromoneGrid[this.getIndex(coord)];
  }

  public getCell(coord: Coord): Cell {
    return new Cell(coord, this.hasAnt(coord), this.hasFood(coord), this.hasObstacle(coord), this.getPheromoneLevel(coord));
  }

  public initObstacles(): void {
    console.log("initializing obstacles")
    // seed static noise map of obstacles
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (Math.random() > 0.68) {
          this.obstacleGrid[this.getIndex({x: c, y: r})] = 1;
        }
      }
    }

    // run smoothing steps for obstacle map using Conway's Game of Life rules 
    for (let i = 0; i < this.obstacleSmoothingSteps; i++) {
      let coord = {x: 0, y: 0};
      for (let r = 0; r <= this.rows; r++) {
        for (let c = 0; c <= this.cols; c++) {
          let neighboringObstacles = 0;
          coord = {x: c, y: r};
          for (const neighbor of this.getAllNeighbors(coord)) {
            if (neighbor.hasObstacle()) {
              neighboringObstacles++;
            }
          }
          
          if (neighboringObstacles >= 4 || this.getAllNeighbors(coord).length < 8) {
            this.nextObstacleGrid[this.getIndex(coord)] = 1;
          } else {
            this.nextObstacleGrid[this.getIndex(coord)] = 0;
          }
        }
      }
      this.obstacleGrid.set(this.nextObstacleGrid);
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

    // for (let r = 0; r < this.rows; r++) {
    //   for (let c = 0; c < this.cols; c++) {
    //     const neighbors = this.countNeighbors(r, c);
    //     const index = this.getIndex(r, c);
    //
    //     if (this.grid[index] > 0) {
    //       this.nextGrid[index] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
    //     } else {
    //       this.nextGrid[index] = (neighbors === 3) ? 1 : 0;
    //     }
    //   }
    // }
    // // swap grids 
    // this.grid.set(this.nextGrid);
  }
}
