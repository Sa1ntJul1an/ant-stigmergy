import type { Coord } from "./types";

export class Cell {
  private coord: Coord;

  private ant: boolean;
  private food: boolean;
  private obstacle: boolean;
  private pheromoneLevel: number;

  constructor(coord: Coord, hasAnt: boolean, hasFood: boolean, hasObstacle: boolean, pheromoneLevel: number) {
    // x and y location
    this.coord = coord;
    
    // cell states
    this.ant = hasAnt;
    this.food = hasFood;
    this.obstacle = hasObstacle;
    this.pheromoneLevel = pheromoneLevel;
  }

  public getCoord(): Coord {
    return this.coord;
  }

  public hasAnt(): boolean {
    return this.ant;
  }

  public hasFood(): boolean {
    return this.food;
  }

  public hasObstacle(): boolean {
    return this.obstacle;
  }

  public getPheromoneLevel(): number {
    return this.pheromoneLevel;
  }
}
