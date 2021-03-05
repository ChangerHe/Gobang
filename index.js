// 渲染形态: dom 或者 canvas可选
const RENDER_TYPE = {
  DOM: "dom",
  CANVAS: "canvas",
};
// 默认的棋盘格子数量 建议设置为可被400整除的数
const DEFAULT_CHESS_SIZE = 15;
// 棋子: 白 黑 和默认的占位
const PIECES = {
  DEFAULT: "default",
  WHITE: "white",
  BLACK: "black",
};

class Game {
  constructor({ renderType, chessSize }, board) {
    // 回合制, 白棋先行, 因为会有第一次的render, 所以默认值设置为黑棋回合
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
    // 事件处理函数
    this.eventHandler = {
      redo: () => {
        if (this.handleQueue.length && this.handleQueuePoint > -1) {
          this.handleQueuePoint = this.handleQueuePoint - 1;
          const lastHandlePos = this.handleQueue[this.handleQueuePoint + 1];
          const currentRound = this.getRound();
          this.gobangData[lastHandlePos.pos[1]][lastHandlePos.pos[0]] =
            PIECES.DEFAULT;
          this.render();
        }
      },
      undo: () => {
        if (this.handleQueuePoint < this.handleQueue.length - 1) {
          this.handleQueuePoint += 1;
          const undoHandle = this.handleQueue[this.handleQueuePoint];
          this.gobangData[undoHandle.pos[1]][undoHandle.pos[0]] =
            undoHandle.handler;
          this.render();
        }
      },
      restart: () => {
        this.resetData();
      },
      contentClick: (e) => {
        const boardPos = [this.board.offsetLeft, this.board.offsetTop];
        const clickedPos = [e.clientX, e.clientY];
        // 边界判断, 如果没有点击到盘面上, 不触发任何操作
        if (
          clickedPos[0] > boardPos[0] + this.boardWidth ||
          clickedPos[0] < boardPos[0] ||
          clickedPos[1] > boardPos[1] + this.boardWidth ||
          clickedPos[1] < boardPos[1]
        ) {
          return;
        }
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
        // 如果点击的地方有子了, 就不进行任何操作
        if (
          this.gobangData[chess[1]] &&
          this.gobangData[chess[1]][chess[0]] === PIECES.DEFAULT
        ) {
          // STEP2: 将对应格子的棋子修改成对应颜色, 切换回合, 更新队列和指针, 渲染内容
          const currentRound = this.getRound();
          this.gobangData[chess[1]][chess[0]] = currentRound;
          // 如果有操作指针, 这个时候需要将指针之后的历史清除掉
          if (this.handleQueuePoint < this.handleQueue.length - 1) {
            this.handleQueue = this.handleQueue.slice(0, this.handleQueuePoint);
          }
          this.handleQueue.push({
            pos: [chess[0], chess[1]],
            handler: currentRound,
          });
          this.handleQueuePoint += 1;

          // STEP3: 渲染页面
          this.render();
          // STEP4: 获胜判断
          // 保证DOM更新成功, 所以这里加了一个timeout
          setTimeout(() => {
            if (this.checkIfWin()) {
              alert(`${this.round} win!!!`);
              this.resetData();
            }
          }, 0);
        }
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
    document.addEventListener("click", this.eventHandler.contentClick);
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
  // 获取回合
  getRound() {
    this.round = this.round === PIECES.WHITE ? PIECES.BLACK : PIECES.WHITE;
    return this.round;
  }
  checkIfWin() {
    const handleLen = this.handleQueue.length;
    // 小于9次操作就不用判断了, 此时黑白各四个
    if (handleLen < 9) return false;
    const currentHandle = this.handleQueue[this.handleQueue.length - 1];
    // 其实求胜的问题本质上是求连续该色棋子数量是否大于4的问题
    // 问题类似于: LeetCode 53题, 但比LC的该题更简单, 可以使用贪心算法的思路求解
    // 横向要判断的数组
    let max = 0;
    for (let i = currentHandle.pos[0] - 4; i <= currentHandle.pos[0] + 4; i++) {
      if (
        this.gobangData[currentHandle.pos[1]] &&
        this.gobangData[currentHandle.pos[1]][i] === currentHandle.handler
      ) {
        max++;
        if (max > 4) {
          return true;
        }
      } else {
        max = 0;
      }
    }
    // 竖向要判断的数组
    max = 0;
    for (let i = currentHandle.pos[1] - 4; i <= currentHandle.pos[1] + 4; i++) {
      if (
        this.gobangData[i] &&
        this.gobangData[i][currentHandle.pos[0]] === currentHandle.handler
      ) {
        max++;
        if (max > 4) {
          return true;
        }
      } else {
        max = 0;
      }
    }
    // 左斜向要判断的数组
    max = 0;
    for (let i = -4; i <= 4; i++) {
      if (
        this.gobangData[currentHandle.pos[1] - i] &&
        this.gobangData[currentHandle.pos[1] - i][currentHandle.pos[0] - i] ===
          currentHandle.handler
      ) {
        max++;
        if (max > 4) {
          return true;
        }
      } else {
        max = 0;
      }
    }
    // 右斜向要判断的数组
    max = 0;
    for (let i = -4; i <= 4; i++) {
      if (
        this.gobangData[currentHandle.pos[1] - i] &&
        this.gobangData[currentHandle.pos[1] - i][currentHandle.pos[0] + i] ===
          currentHandle.handler
      ) {
        max++;
        if (max > 4) {
          return true;
        }
      } else {
        max = 0;
      }
    }
  }
  render() {
    this.renderType === RENDER_TYPE.DOM
      ? this.renderDOM()
      : this.renderCanvas();
    round.innerHTML = this.round === PIECES.BLACK ? "白棋回合" : "黑棋回合";
  }
  renderDOM() {
    const { boardWidth, piecesWidth, circleWidth } = this;
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
        // 画圆形
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
