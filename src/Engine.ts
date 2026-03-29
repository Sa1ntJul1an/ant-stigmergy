import type { Grid } from "./Grid";
import type { Coord } from "./types";

enum EngineState {
  GENERATING_OBSTACLES,
  PLACING_NEST
}

export class Engine {
  private antPopulation: number;
  private antsInNest: number;
  private nestLocation: Coord;
  private environment: Grid | null;
  private currentState: EngineState;
  
  constructor(initPopulation: number) {
    this.antPopulation = initPopulation;

    this.antsInNest = initPopulation;
    this.nestLocation = {x: -100, y: -100};
    this.environment = null;
    this.currentState = EngineState.PLACING_NEST;
  }

  public handleMouseDown(coord: {x: number, y: number}): void {
    switch (this.currentState) {
      case EngineState.PLACING_NEST:
        if (this.environment === null) {
          console.error("attempting to place nest, but environment is not initialized")
          return;
        }
        if (this.environment.getCell(coord).hasObstacle()) {
        }
    }
  }

  public setEnvironment(environment: Grid) {
    this.environment = environment;
  }

  public setNestLocation(nestLocation: Coord) {
    
    this.nestLocation = nestLocation;
  }
}
