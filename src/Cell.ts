import type { Coord } from "./types";

const OBSTACLE = 1 << 0;
const FOOD = 1 << 1;
const ANT = 1 << 2;
const NEST = 1 << 3;

export class Cell {
  private coord: Coord;
  
  private currentState: number;
  private pheromoneLevel: number;

  constructor(coord: Coord, state: number, pheromoneLevel: number) {
    // x and y location
    this.coord = coord;
    
    // cell states
    this.currentState = state;
    this.pheromoneLevel = pheromoneLevel;
  }

  public getCoord(): Coord {
    return this.coord;
  }

  public hasAnt(): boolean {
    return (this.currentState & ANT) !== 0;
  }

  public hasFood(): boolean {
    return (this.currentState & FOOD) !== 0;
  }

  public hasObstacle(): boolean {
    return (this.currentState & OBSTACLE) !== 0;
  }

  public getPheromoneLevel(): number {
    return this.pheromoneLevel;
  }

  public getState(): number {
    return this.currentState;
  }
}
