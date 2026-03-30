import type { Grid } from "./Grid";
import { Renderer } from "./Renderer";
import type { Coord } from "./types";

enum EngineState {
  GENERATING_OBSTACLES,
  PLACING_NEST,
  PLACING_FOOD
}

export class Engine {
  private antPopulation: number;
  private antsInNest: number;
  private environment: Grid | null;
  private currentState: EngineState;
  private renderer: Renderer;
  
  constructor(initPopulation: number, renderer: Renderer) {
    this.antPopulation = initPopulation;

    this.antsInNest = initPopulation;
    this.environment = null;
    this.currentState = EngineState.PLACING_NEST;
    this.renderer = renderer;
  }

  public handleMouseDown(coord: {x: number, y: number}): void {
    switch (this.currentState) {
      case EngineState.PLACING_NEST:
        if (this.environment === null) {
          console.error("attempting to place nest, but environment is not initialized")
          return;
        }
        this.environment.setNest(coord.x, coord.y);
        this.currentState = EngineState.PLACING_FOOD;
        break;
      case EngineState.PLACING_FOOD:
        if (this.environment === null) {
          console.error("attempting to place food, but environment is not initialized")
          return;
        }
        this.environment.spawnAnt(coord.x, coord.y);
        break;
    }
  }

  public render(): void {
    this.renderer.clearWindow();
    if (this.environment !== null) {
      this.renderer.drawGrid(this.environment);
    }
  }

  public setEnvironment(environment: Grid) {
    this.environment = environment;
  }

  public initObstacles(): void {
    if (this.environment !== null) {
      this.environment.initObstacles();
      this.currentState = EngineState.PLACING_NEST;
    }
  }

  public step(): void {
    switch (this.currentState) {
      case EngineState.PLACING_FOOD:
        this.environment?.step();
        break;
    }
  }
}
