import { ANT, FOOD, OBSTACLE, type Grid } from "./Grid";

export class Renderer {
  private width: number;
  private height: number;
  private cellSize: number;

  private emptyGridColor: string;
  private obstacleColor: string;
  private antColor: string;
  private foodColor: string;
  private pheromoneColor: string;
  
  constructor(private ctx: CanvasRenderingContext2D, width: number, height: number, cellSize: number) {
    this.height = height; 
    this.width = width;
    this.cellSize = cellSize;
   
    this.emptyGridColor = '#2f2f2f'
    this.obstacleColor = '#ff3a09';
    this.antColor = 'white';
    this.foodColor = 'green';
    this.pheromoneColor = 'magenta';
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

  public drawGrid(grid: Grid): void {
    const cellStates = grid.cellStates;
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const index = grid.getIndex(c, r);
        if (cellStates[index] & ANT) {
          this.ctx.fillStyle = this.antColor;
        } else if (cellStates[index] & FOOD) {
          this.ctx.fillStyle = this.foodColor;
        } else if (cellStates[index] & OBSTACLE) {
          this.ctx.fillStyle = this.obstacleColor;
        // } else if (cell.getPheromoneLevel() > 0) {
        //   this.ctx.fillStyle = this.pheromoneColor;
        } else {
          this.ctx.fillStyle = this.emptyGridColor;
        }
        this.ctx.fillRect(
          c * this.cellSize,
          r * this.cellSize,
          this.cellSize - 1,
          this.cellSize - 1
        )
      }
    }
    
  }
}
