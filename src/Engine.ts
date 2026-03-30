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
  private nestLocation: Coord;
  private environment: Grid | null;
  private currentState: EngineState;
  private renderer: Renderer;
  
  constructor(initPopulation: number, renderer: Renderer) {
    this.antPopulation = initPopulation;

    this.antsInNest = initPopulation;
    this.nestLocation = {x: -100, y: -100};
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
        if (!this.environment.getCell(coord).hasObstacle()) {
          this.setNestLocation(coord);
          this.currentState = EngineState.PLACING_FOOD;
        }
    }
  }

  public render(): void {
    this.renderer.clearWindow();
    if (this.environment !== null) {
      this.renderer.draw(this.environment);
    }
  }

  public setEnvironment(environment: Grid) {
    this.environment = environment;
  }

  private setNestLocation(nestLocation: Coord) {
    this.nestLocation = nestLocation;
  }
}
