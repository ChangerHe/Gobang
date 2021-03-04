const GAME_TYPE = {
  DOM: 'dom',
  CANVAS: 'canvas'
};
const DEFAULT_CHESS_SIZE = 15;
const PIECES = {
  DEFAULT: 'default',
  WHITE: 'white',
  BLACK: 'black'
};

class Game {
  constructor(
    { gameType = GAME_TYPE.DOM, chessSize = DEFAULT_CHESS_SIZE },
    board
  ) {
    this.gameType = gameType;
    this.board = board;
    this.chessSize = chessSize;
    this.handleQueue = [];
    this.handleQueuePoint = -1;
    this.gobangData = [];
  }

  start() {
    redo.addEventListener('click', () => {
      console.log('redo click');
    });
    undo.addEventListener('click', () => {
      console.log('undo click');
    });
    restart.addEventListener('click', () => {
      console.log('restart click');
    });
    toggle.addEventListener('click', () => {
      console.log('toggle click');
    });
    this.gobangData = new Array(this.chessSize)
      .fill(PIECES.DEFAULT)
      .map((v) => new Array(this.chessSize).fill(PIECES.DEFAULT));
    this.handleQueue = [];
    this.handleQueuePoint = -1;
    this.render();
  }
  render() {
    this.gameType === GAME_TYPE.DOM ? this.renderDOM() : this.renderCanvas();
  }
  renderDOM() {
    const boardWidth = this.board.clientWidth;
    const piecesWidth = parseInt(boardWidth / this.chessSize);
    const circleWidth = parseInt(boardWidth / this.chessSize / 1.2);
    console.log(boardWidth, 'boardWidth');
    const frag = document.createDocumentFragment();
    this.gobangData.forEach((v) => {
      const row = document.createElement('div');
      row.classList.add('row');
      row.style = `width: ${piecesWidth};height: ${piecesWidth}`;
      v.forEach((w) => {
        const cell = document.createElement('div');
        const circle = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute(
          'style',
          `width:${piecesWidth}px;height:${piecesWidth}px;`
        );
        circle.classList.add('circle', w);
        circle.setAttribute(
          'style',
          `width:${circleWidth}px;height:${circleWidth}px;`
        );
        cell.appendChild(circle);
        row.appendChild(cell);
      });
      frag.appendChild(row);
    });
    console.log(this.board, 'this.board');
    this.board.appendChild(frag);
  }
  renderCanvas() {}
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game(
    {
      gameType: GAME_TYPE.DOM,
      chessSize: DEFAULT_CHESS_SIZE
    },
    document.getElementById('board')
  );
  game.start();
});
