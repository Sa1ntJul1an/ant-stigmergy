import './style.css'
import { Renderer } from './Renderer'
import { Grid } from './Grid';

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

  const gridSize = 5;

  const renderer = new Renderer(ctx, width, height, gridSize);
  const grid = new Grid(height / gridSize, width / gridSize);

  grid.initObstacles();

  // Event listeners 
  canvas.addEventListener('mousedown', (e) => {
  })

  canvas.addEventListener('mousemove', (e) => {
    // rrt.handleMouseMove({
    //   x: e.offsetX, 
    //   y: e.offsetY
    // });
  })

  canvas.addEventListener('mouseleave', (e) => {
  })

  canvas.addEventListener('mouseup', (e) => {
  })

  function update() {
    renderer.clearWindow();
    renderer.draw(grid);
    setTimeout(() => requestAnimationFrame(update), 10);
  }

  update();
}

window.addEventListener('load', start);
