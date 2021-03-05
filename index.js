const RENDER_TYPE = {
  DOM: "dom",
  CANVAS: "canvas",
};
// 默认的棋盘格子数量 建议设置为可被400整除的数
const DEFAULT_CHESS_SIZE = 10;
const PIECES = {
  DEFAULT: "default",
  WHITE: "white",
  BLACK: "black",
};

class Game {
  constructor(
    { renderType = RENDER_TYPE.DOM, chessSize = DEFAULT_CHESS_SIZE },
    board
  ) {
    // 回合制, 白棋先行
    this.round = PIECES.BLACK;
    // 游戏渲染类型: CANVAS or DOM
    this.renderType = renderType;
    // 挂载的游戏的面板
    this.board = board;
    // 面板的宽度
    this.boardWidth = board.clientWidth;
    // 单个格子的宽度
    this.piecesWidth = parseInt(this.boardWidth / chessSize);
    // 棋子的宽度
    this.circleWidth = parseInt(this.boardWidth / chessSize / 1.2);
    // 棋盘各自数量
    this.chessSize = chessSize;
    // 操作队列
    this.handleQueue = [];
    // 操作队列指针
    this.handleQueuePoint = -1;
    // 棋盘数据
    this.gobangData = [];

    this.eventHandler = {
      redo: () => {
        console.log("redo click");
      },
      undo: () => {
        console.log("undo click");
      },
      restart: () => {
        console.log("restart click");
        this.resetData();
      },
      contentClick: (e) => {
        console.log("content clicked", e.clientX, e.clientY);
        console.log(
          this.board,
          "this.board",
          this.board.offsetLeft,
          this.board.offsetTop
        );
        const boardPos = [this.board.offsetLeft, this.board.offsetTop];
        const clickedPos = [e.clientX, e.clientY];
        // STEP1: 使用点击位置与boardPos之间的偏振值, 计算出点击的格子是哪一个
        const chess = [
          ~~(
            (clickedPos[0] - boardPos[0] + this.piecesWidth / 2) /
            this.piecesWidth
          ),
          ~~(
            (clickedPos[1] - boardPos[1] + this.piecesWidth / 2) /
            this.piecesWidth
          ),
        ];
        console.log(
          chess,
          "chess",
          boardPos,
          clickedPos,
          this.gobangData,
          clickedPos[0] - boardPos[0],
          clickedPos[1] - boardPos[1]
        );
        // STEP2: 将对应格子的棋子修改成对应颜色
        if (this.gobangData[chess[1]][chess[0]] === PIECES.DEFAULT) {
          this.gobangData[chess[1]][chess[0]] = this.getRound();
          this.render();
        }
        // STEP3: 渲染页面
        // STEP4: 获胜判断
      },
      toggleClick: () => {
        this.renderType =
          this.renderType === RENDER_TYPE.CANVAS
            ? RENDER_TYPE.DOM
            : RENDER_TYPE.CANVAS;
        this.render();
      },
    };
  }

  start() {
    redo.addEventListener("click", this.eventHandler.redo);
    undo.addEventListener("click", this.eventHandler.undo);
    restart.addEventListener("click", this.eventHandler.restart);
    window.addEventListener("click", this.eventHandler.contentClick);
    toggle.addEventListener("click", this.eventHandler.toggleClick);
    this.resetData();
  }
  resetData() {
    this.gobangData = new Array(this.chessSize)
      .fill(PIECES.DEFAULT)
      .map((v) => new Array(this.chessSize).fill(PIECES.DEFAULT));
    this.handleQueue = [];
    this.handleQueuePoint = -1;
    this.render();
  }
  getRound() {
    this.round = this.round === PIECES.WHITE ? PIECES.BLACK : PIECES.WHITE;
    return this.round;
  }
  render() {
    this.renderType === RENDER_TYPE.DOM
      ? this.renderDOM()
      : this.renderCanvas();
    round.innerHTML = this.round === PIECES.BLACK ? "白棋回合" : "黑棋回合";
  }
  renderDOM() {
    const { boardWidth, piecesWidth, circleWidth } = this;
    console.log(boardWidth, "boardWidth");
    const frag = document.createDocumentFragment();
    this.gobangData.forEach((v, i) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.style = `width: ${piecesWidth};height: ${piecesWidth}`;
      v.forEach((w, j) => {
        const cell = document.createElement("div");
        const circle = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute(
          "style",
          `width:${piecesWidth}px;height:${piecesWidth}px;`
        );

        // 处理边界值情况
        if (i != 0 && j != 0) {
          circle.classList.add("circle", w);
          circle.setAttribute(
            "style",
            `width:${circleWidth}px;height:${circleWidth}px;`
          );
        }
        cell.appendChild(circle);
        row.appendChild(cell);
      });
      frag.appendChild(row);
    });
    console.log(this.board, "this.board");
    this.board.innerHTML = "";
    this.board.appendChild(frag);
  }
  renderCanvas() {
    const { boardWidth, piecesWidth, circleWidth } = this;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", `${boardWidth}px`);
    canvas.setAttribute("height", `${boardWidth}px`);
    const context = canvas.getContext("2d");

    this.gobangData.forEach((v, i) => {
      v.forEach((w, j) => {
        // 画每一个小矩形
        context.beginPath();
        context.moveTo(piecesWidth * j, piecesWidth * i);
        context.lineTo(piecesWidth * (j + 1), piecesWidth * i);
        context.lineTo(piecesWidth * (j + 1), piecesWidth * (i + 1));
        context.lineTo(piecesWidth * j, piecesWidth * (i + 1));
        context.lineTo(piecesWidth * j, piecesWidth * i);
        context.stroke();
        context.closePath();
        // 处理边界值情况
        if (i === 0 || j === 0) return;
        context.beginPath();
        context.arc(
          piecesWidth * j,
          piecesWidth * i,
          circleWidth / 2,
          0,
          2 * Math.PI,
          false
        );
        const gradient = context.createRadialGradient(
          piecesWidth * j,
          piecesWidth * i,
          circleWidth / 2,
          piecesWidth * j,
          piecesWidth * i,
          0
        );
        if (w === PIECES.BLACK) {
          gradient.addColorStop(0, "black");
          gradient.addColorStop(1, "white");
        } else if (w === PIECES.WHITE) {
          gradient.addColorStop(0, "#d1d1d1");
          gradient.addColorStop(1, "#f9f9f9");
        }
        context.fillStyle = gradient;
        context.fill();
        context.closePath();
      });
    });
    this.board.innerHTML = "";
    this.board.appendChild(canvas);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const game = new Game(
    {
      renderType: RENDER_TYPE.CANVAS,
      chessSize: DEFAULT_CHESS_SIZE,
    },
    document.getElementById("board")
  );
  game.start();
});
