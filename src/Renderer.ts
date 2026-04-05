import { EXPLORING_ANT, FOOD, NEST, OBSTACLE, RETURNING_ANT, type Grid } from "./Grid";

export class Renderer {
  private width: number;
  private height: number;
  private cellSize: number;

  private emptyGridColor: string;
  private obstacleColor: string;
  private antColor: string;
  private foodColor: string;
  private nestColor: string;
  private explorePheromoneColor: string;
  private returnPheromoneColor: string;

  private pheromoneColors = Array.from({length: 101}, (_, i) => `rgba(255, 0, 255, ${i / 100})`);

  constructor(private ctx: CanvasRenderingContext2D, width: number, height: number, cellSize: number) {
    this.height = height; 
    this.width = width;
    this.cellSize = cellSize;
   
    this.emptyGridColor = '#1f1f1f'
    this.obstacleColor = '#ff3a09';
    this.antColor = 'white';
    this.foodColor = 'green';
    this.nestColor = 'yellow'
    this.explorePheromoneColor = 'magenta';
    this.returnPheromoneColor = 'cyan';
  }

  public getHeight(): number {
    return this.height;
  }

  public getWidth(): number {
    return this.width;
  }

  public clearWindow(): void {
    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height); 
  }

  private drawCell(c: number, r: number) {
    this.ctx.fillRect(
      c * this.cellSize,
      r * this.cellSize,
      this.cellSize - 1,
      this.cellSize - 1
    )
  }

  public drawGrid(grid: Grid): void {
    const cellStates = grid.cellStates;
    const explorePheromoneLevels = grid.pheromoneGrid;
    let index = grid.getIndex(0, 0);
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        index = grid.getIndex(c, r);
        if (cellStates[index] & NEST) {
          this.ctx.fillStyle = this.nestColor;
        } else if (cellStates[index] & FOOD) {
          this.ctx.fillStyle = this.foodColor;
        } else if (cellStates[index] & OBSTACLE) {
          this.ctx.fillStyle = this.obstacleColor;
        } else {
          this.ctx.fillStyle = this.emptyGridColor;
        }
        this.drawCell(c, r);

        // draw pheromone levels if they exist
        const pheromoneLevel = explorePheromoneLevels[index];
        if (pheromoneLevel > 0 && !(cellStates[index] & (OBSTACLE | FOOD | NEST))) {
          this.ctx.fillStyle = this.pheromoneColors[Math.min(Math.round(pheromoneLevel), 100)];
          this.drawCell(c, r);
        }

        // draw ants over pheromone levels
        if (cellStates[index] & EXPLORING_ANT || cellStates[index] & RETURNING_ANT) {
          this.ctx.fillStyle = this.antColor;
          this.drawCell(c, r);
        }
      }
    }
  }
}
