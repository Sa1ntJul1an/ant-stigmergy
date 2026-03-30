import './style.css'
import { Renderer } from './Renderer'
import { Grid } from './Grid';
import { Engine } from './Engine';

function start() {
  const canvas = document.getElementById('antCanvas') as HTMLCanvasElement;
  const width = canvas.width; 
  const height = canvas.height;
  if (!canvas) {
    console.error("Canvas element not found.");
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("WebGL/2D Context not supported.");
    return;
  }

  const genObstaclesBtn = document.getElementById('refreshObstacles') as HTMLButtonElement;
  
  const cellSize = 5;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);

  const renderer = new Renderer(ctx, width, height, cellSize);
  const engine = new Engine(1000, renderer);
  const grid = new Grid(rows, cols);


  genObstaclesBtn.addEventListener('click', () => {
    grid.initObstacles();
    engine.setEnvironment(grid);
  })

  // Event listeners 
  canvas.addEventListener('mousedown', (e) => {
    const gridX = Math.floor(e.offsetX / cellSize);
    const gridY = Math.floor(e.offsetY / cellSize);
    engine.handleMouseDown({
      x: Math.max(0, Math.min(gridX, cols - 1)),
      y: Math.max(0, Math.min(gridY, rows - 1))
    });
  })

  canvas.addEventListener('mousemove', (e) => {
    const gridX = Math.floor(e.offsetX / cellSize);
    const gridY = Math.floor(e.offsetY / cellSize);
    // engine.handleMouseMove({
    //   x: Math.max(0, Math.min(gridX, cols - 1)),
    //   y: Math.max(0, Math.min(gridY, rows - 1))
    // });
  })

  canvas.addEventListener('mouseleave', (e) => {
    const gridX = Math.floor(e.offsetX / cellSize);
    const gridY = Math.floor(e.offsetY / cellSize);
    // engine.handleMouseLeave({
    //   x: Math.max(0, Math.min(gridX, cols - 1)),
    //   y: Math.max(0, Math.min(gridY, rows - 1))
    // });
  })

  canvas.addEventListener('mouseup', (e) => {
    const gridX = Math.floor(e.offsetX / cellSize);
    const gridY = Math.floor(e.offsetY / cellSize);
    // engine.handleMouseUp({
    //   x: Math.max(0, Math.min(gridX, cols - 1)),
    //   y: Math.max(0, Math.min(gridY, rows - 1))
    // });
  })

  grid.initObstacles();
  engine.setEnvironment(grid);

  function update() {
    engine.render();
    setTimeout(() => requestAnimationFrame(update), 10);
  }

  update();
}

window.addEventListener('load', start);
