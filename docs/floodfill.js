"use strict";

(() => {
  window.addEventListener("load", (event) => {
    // *****************************************************************************
    // #region Constants and Variables

    // Canvas references
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    // UI references
    const restartButton = document.querySelector("#restart");
    const colorSelectButtons = document.querySelectorAll(".color-select");
    const undoButton = document.getElementById("undo");

    // Constants
    const CELL_COLORS = {
      white: [255, 255, 255],
      black: [0, 0, 0],
      red: [255, 0, 0],
      green: [0, 255, 0],
      blue: [0, 0, 255],
    };
    const CELLS_PER_AXIS = 9;
    const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
    const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;

    // Game objects
    let replacementColor = CELL_COLORS.white;
    let grids = [];
    let score = 0;
    
    const totalCells = CELLS_PER_AXIS * CELLS_PER_AXIS;

    // #endregion

    // *****************************************************************************
    // #region Game Logic

    function startGame(startingGrid = []) {
      if (startingGrid.length === 0) {
        startingGrid = initializeGrid();
      }
      initializeHistory(startingGrid);
      render(grids[0]);
    }

    function initializeGrid() {
      const newGrid = [];
      for (let i = 0; i < CELLS_PER_AXIS * CELLS_PER_AXIS; i++) {
        newGrid.push(chooseRandomPropertyFrom(CELL_COLORS));
      }
      return newGrid;
    }

    function initializeHistory(startingGrid) {
      grids = [];
      grids.push(startingGrid);
    }

    function render(grid) {
      for (let i = 0; i < grid.length; i++) {
        ctx.fillStyle = `rgb(${grid[i][0]}, ${grid[i][1]}, ${grid[i][2]})`;
        ctx.fillRect(
          (i % CELLS_PER_AXIS) * CELL_WIDTH,
          Math.floor(i / CELLS_PER_AXIS) * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      }
    }

    function updateGridAt(mousePositionX, mousePositionY) {
      const gridCoordinates = convertCartesiansToGrid(
        mousePositionX,
        mousePositionY
      );
      const newGrid = grids[grids.length - 1].slice(); // Makes a copy of the most recent grid state
      floodFill(
        newGrid,
        gridCoordinates,
        newGrid[gridCoordinates.row * CELLS_PER_AXIS + gridCoordinates.column]
      );
      grids.push(newGrid);
      render(newGrid);
      checkWin();
    }

    function floodFill(grid, gridCoordinate, colorToChange) {
      if (arraysAreEqual(colorToChange, replacementColor)) return; // The current cell is already the selected color
      if (
        !arraysAreEqual(
          grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column],
          colorToChange
        )
      )
        return; // The current cell is a different color than the initially clicked-on cell
      grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] =
        replacementColor;
      score++;
      updateScore();
      floodFill(
        grid,
        {
          column: Math.max(gridCoordinate.column - 1, 0),
          row: gridCoordinate.row,
        },
        colorToChange
      );
      floodFill(
        grid,
        {
          column: Math.min(gridCoordinate.column + 1, CELLS_PER_AXIS - 1),
          row: gridCoordinate.row,
        },
        colorToChange
      );
      floodFill(
        grid,
        {
          column: gridCoordinate.column,
          row: Math.max(gridCoordinate.row - 1, 0),
        },
        colorToChange
      );
      floodFill(
        grid,
        {
          column: gridCoordinate.column,
          row: Math.min(gridCoordinate.row + 1, CELLS_PER_AXIS - 1),
        },
        colorToChange
      );
    }

    function restart() {
      score = 0; // Reset score
      updateScore(); // Update the score display
      startGame(); // Start the game with a new grid
    }

    function checkWin() {
      const lastGrid = grids[grids.length - 1];
      const firstColor = lastGrid[0]; // Get the color of the first cell
      const isWinning = lastGrid.every((cellColor) =>
        arraysAreEqual(cellColor, firstColor)
      );
      if (isWinning) {
        alert("You win! All cells are the same color.");
      }
    }
    // Undo function

    function undo() {
      if (grids.length > 1) {
        grids.pop(); // Remove the most recent grid state
        score--; // Decrement the score
        updateScore(); // Update the score display
        render(grids[grids.length - 1]); // Render the previous grid state
      }
    }
    // #endregion

    // *****************************************************************************
    // #region Event Listeners

    canvas.addEventListener("mousedown", gridClickHandler);
    function gridClickHandler(event) {
      updateGridAt(event.offsetX, event.offsetY);
    }

    restartButton.addEventListener("mousedown", restartClickHandler);
    function restartClickHandler() {
      restart();
    }

    colorSelectButtons.forEach((button) => {
      button.addEventListener(
        "mousedown",
        () => (replacementColor = CELL_COLORS[button.name])
      );
    });

    undoButton.addEventListener("mousedown", undoClick);
    function undoClick() {
      undo();
    }
    // #endregion

    // *****************************************************************************
    // #region Helper Functions

    function convertCartesiansToGrid(xPos, yPos) {
      return {
        column: Math.floor(xPos / CELL_WIDTH),
        row: Math.floor(yPos / CELL_HEIGHT),
      };
    }

    function chooseRandomPropertyFrom(object) {
      const keys = Object.keys(object);
      return object[keys[Math.floor(keys.length * Math.random())]]; // Truncates to integer
    }

    function arraysAreEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => value === arr2[index]);
    }

    function updateScore() {
      scoreCount.innerText = score;
    }

    // #endregion

    // Start game
    startGame();
  });
})();

const scoreCount = document.getElementById("score");
