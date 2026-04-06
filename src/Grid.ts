export const OBSTACLE = 1 << 0;
export const FOOD = 1 << 1;
export const NEST = 1 << 2;
export const EXPLORING_ANT = 1 << 3;
export const RETURNING_ANT = 1 << 4;
export const UP_ANT = 1 << 5;
export const RIGHT_ANT = 1 << 6;

type CellState = number;

export class Grid {

  public cellStates: Uint8Array;
  private nextCellStates: Uint8Array;
  public pheromoneGrid: Float32Array;
  private nextPheromoneGrid: Float32Array;

  private pheromoneEvaporation: number;
  private pheromoneDeposition: number;
  private pheromoneDiffusionRate: number;
  private windDirectionDeg: number;
  private windDirectionRad: number;

  private diffusionKernel: Float32Array;

  private obstacleSmoothingSteps: number;

  constructor(public rows: number, public cols: number) {
    this.cellStates = new Uint8Array(rows * cols).fill(0);
    this.nextCellStates = new Uint8Array(rows * cols).fill(0);

    this.pheromoneGrid = new Float32Array(rows * cols).fill(0);
    this.nextPheromoneGrid = new Float32Array(rows * cols).fill(0);
    
    this.diffusionKernel = new Float32Array(3 * 3).fill(0);

    this.pheromoneEvaporation = 0.5;
    this.pheromoneDeposition = 20.0;
    this.pheromoneDiffusionRate = 0.08;
    this.windDirectionDeg = 70.0;
    this.windDirectionRad = (this.windDirectionDeg * Math.PI) / 180;
    
    this.obstacleSmoothingSteps = 10;

    // generate diffusion kernel weighted in direction of wind
    this.generateDiffusionKernel();
  }

  public setWindDirection(directionDeg: number): void {
    this.windDirectionDeg = directionDeg;
    this.windDirectionRad = (this.windDirectionDeg * Math.PI) / 180;
    this.generateDiffusionKernel();
  }

  public setWindStrength(strength: number) : void {
    strength = Math.min(Math.max(strength, 0), 1);
    this.pheromoneDiffusionRate = strength;
    this.generateDiffusionKernel();
  }

  private clearPheromones(): void {
    this.pheromoneGrid.fill(0);
    this.nextPheromoneGrid.fill(0);
  }

  private generateDiffusionKernel() {
    let kernelSum = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        // this logic calculates a steerable kernel that is similar to a box blur, but biased by an angle and strength to simulate wind
        let kernelValue = 1 + this.pheromoneDiffusionRate * (x * Math.cos(this.windDirectionRad) + y * Math.sin(this.windDirectionRad));
        this.diffusionKernel[(y + 1) * 3 + (x + 1)] = kernelValue;
        kernelSum += kernelValue;
      }
    }
    // normalize kernel
    this.diffusionKernel = this.diffusionKernel.map(w => w / kernelSum);
  }

  private calculatedDiffusedPheromoneLevel(index: number): number {
    let pheromoneLevel = 0;
    for (let x_offset = -1; x_offset <= 1; x_offset++) {
      for (let y_offset = -1; y_offset <= 1; y_offset++) {
        const coord = this.getCoord(index);
        let neighborPheromoneLevel = 0;
        if (coord.x + x_offset >= 0 && coord.x + x_offset < this.cols && coord.y + y_offset >= 0 && coord.y + y_offset < this.rows) {
          neighborPheromoneLevel = this.pheromoneGrid[this.getIndex(coord.x + x_offset, coord.y + y_offset)];
        }
        pheromoneLevel += neighborPheromoneLevel * this.diffusionKernel[(1 + y_offset) * 3 + (1 + x_offset)];
      }
    }
    return pheromoneLevel;
  }

  private clearObstacles(): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cellStates[this.getIndex(c, r)] &= ~OBSTACLE;
      }
    }
  }

  public reset(): void {
    this.clearPheromones();
    this.clearObstacles();
  }

  // map (x, y) to 1D index 
  public getIndex(x: number, y: number): number {
    return y * this.cols + x;
  }

  public getCoord(index: number): {x: number, y: number} {
    const x = index % this.cols;
    const y = (index / this.cols) | 0;
    return {x, y};
  }

  public setNest(x: number, y: number, nestSize: number) {
    console.log(`setting nest at (${x}, ${y}) with width ${nestSize}`);
    let nestRadius = Math.floor(nestSize / 2);
    for (let x_offset = -nestRadius; x_offset <= nestRadius; x_offset++) {
      for (let y_offset = -nestRadius; y_offset <= nestRadius; y_offset++) {
        this.cellStates[this.getIndex(x + x_offset, y + y_offset)] |= NEST;
      }
    }
  }

  public spawnAnt(x: number, y: number) {
    console.log(`spawning ant at (${x}, ${y})`);
    if (this.cellStates[this.getIndex(x, y)] & OBSTACLE) {
      return;
    }
    this.cellStates[this.getIndex(x, y)] |= EXPLORING_ANT;
  }

  public initObstacles(): void {
    console.log("initializing obstacles")
    this.reset();
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
    for (let index = 0; index < this.cellStates.length; index++) {
      this.nextCellStates[index] = this.cellStates[index] & (OBSTACLE | FOOD | NEST);
      
      // diffusion of pheromones dicated by wind direction and diffusion rate 
      let pheromoneLevel = this.calculatedDiffusedPheromoneLevel(index);
      // decay of pheromones
      pheromoneLevel -= this.pheromoneEvaporation;
      this.nextPheromoneGrid[index] = Math.max(pheromoneLevel, 0);
      
      // Ant movements
      if (this.cellStates[index] & EXPLORING_ANT) {
        // exploring ant move logic
        this.nextCellStates[index - 1] |= EXPLORING_ANT;
        this.nextCellStates[index] &= ~EXPLORING_ANT;
        this.nextPheromoneGrid[index] += this.pheromoneDeposition;
        this.nextPheromoneGrid[index] = Math.min(this.nextPheromoneGrid[index], 100.0);
      }
    }
    // swap buffers
    const tempCellStates = this.cellStates;
    this.cellStates = this.nextCellStates;
    this.nextCellStates = tempCellStates;

    const tempPheromoneGrid = this.pheromoneGrid;
    this.pheromoneGrid = this.nextPheromoneGrid;
    this.nextPheromoneGrid = tempPheromoneGrid;
  }
}
