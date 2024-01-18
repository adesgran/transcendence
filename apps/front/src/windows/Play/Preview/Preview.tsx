import "../Pong/Pong.css";
import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { gameInfo } from "shared/src/gameInfo.interface";
import { normalGameInfo } from "shared/src/normalGameInfo";
import { gameInfoDto } from "shared/src/gameInfo.dto";
import { socket } from "../../../socket";

export default function Preview() {
	const [gameInfo, setGameInfo] = useState<gameInfo>(normalGameInfo);

	function drawBoardMidline(p: p5) {
		p.fill(gameInfo.borderColor);
		let tmp = gameInfo.gameysize / gameInfo.borderSize;
		tmp = Math.floor(tmp);
		tmp = tmp / 2;
		tmp = Math.floor(tmp);
		let i =
			gameInfo.gamey +
			(gameInfo.gameysize - gameInfo.borderSize * (tmp * 2 - 1)) / 2;
		while (i < gameInfo.gamey + gameInfo.gameysize - gameInfo.borderSize) {
			p.rect(
				gameInfo.xsize / 2 - gameInfo.borderSize / 2,
				i,
				gameInfo.borderSize,
				gameInfo.borderSize
			);
			i = i + gameInfo.borderSize * 2;
		}
	}

	function drawMenuMidline(p: p5) {
		p.fill(gameInfo.borderColor);
		p.rect(
			gameInfo.xsize / 2 - gameInfo.borderSize / 2,
			gameInfo.borderSize - 1,
			gameInfo.borderSize,
			gameInfo.menuSize + 2
		);
	}
	function drawBorder(p: p5) {
		p.fill(gameInfo.borderColor);
		p.rect(0, 0, gameInfo.xsize, gameInfo.borderSize);
		p.rect(
			0,
			gameInfo.ysize - gameInfo.borderSize,
			gameInfo.xsize,
			gameInfo.borderSize
		);
		p.rect(
			0,
			gameInfo.borderSize,
			gameInfo.borderSize,
			gameInfo.ysize - 2 * gameInfo.borderSize
		);
		p.rect(
			gameInfo.xsize - gameInfo.borderSize,
			gameInfo.borderSize,
			gameInfo.borderSize,
			gameInfo.ysize - 2 * gameInfo.borderSize
		);
	}

	function drawBar(p: p5) {
		p.fill(gameInfo.oneBarColor);
		p.rect(
			gameInfo.gamex + gameInfo.barDist,
			gameInfo.gamey + gameInfo.oneBary,
			gameInfo.barLarge,
			gameInfo.barSize
		);
		p.fill(gameInfo.twoBarColor);
		p.rect(
			gameInfo.gamex +
				gameInfo.gamexsize -
				gameInfo.barDist -
				gameInfo.barLarge,
			gameInfo.gamey + gameInfo.twoBary,
			gameInfo.barLarge,
			gameInfo.barSize
		);
	}

	function drawOne(p: p5, x: number, y: number) {
		p.rect(
			x + gameInfo.numberSize * 2,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
		p.rect(
			x + gameInfo.numberSize,
			y + gameInfo.numberSize,
			gameInfo.numberSize,
			gameInfo.numberSize
		);
	}

	function drawTwo(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 4
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize,
			gameInfo.numberSize * 3
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
	}

	function drawThree(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
	}

	function drawFour(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize, gameInfo.numberSize * 4);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
	}

	function drawFive(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(x, y, gameInfo.numberSize, gameInfo.numberSize * 4);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x + gameInfo.numberSize * 3,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize,
			gameInfo.numberSize * 3
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
	}

	function drawSix(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(x, y, gameInfo.numberSize, gameInfo.numberSize * 7);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x + gameInfo.numberSize * 3,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize,
			gameInfo.numberSize * 4
		);
	}

	function drawSeven(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
	}

	function drawEight(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(x, y, gameInfo.numberSize, gameInfo.numberSize * 7);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
	}

	function drawNine(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(x, y, gameInfo.numberSize, gameInfo.numberSize * 4);
		p.rect(
			x,
			y + gameInfo.numberSize * 3,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
	}

	function drawZero(p: p5, x: number, y: number) {
		p.rect(x, y, gameInfo.numberSize * 4, gameInfo.numberSize);
		p.rect(x, y, gameInfo.numberSize, gameInfo.numberSize * 7);
		p.rect(
			x,
			y + gameInfo.numberSize * 6,
			gameInfo.numberSize * 4,
			gameInfo.numberSize
		);
		p.rect(
			x + gameInfo.numberSize * 3,
			y,
			gameInfo.numberSize,
			gameInfo.numberSize * 7
		);
	}

	function drawNumber(p: p5, nb: number, x: number, y: number) {
		if (nb === 0) drawZero(p, x, y);
		if (nb === 1) drawOne(p, x, y);
		if (nb === 2) drawTwo(p, x, y);
		if (nb === 3) drawThree(p, x, y);
		if (nb === 4) drawFour(p, x, y);
		if (nb === 5) drawFive(p, x, y);
		if (nb === 6) drawSix(p, x, y);
		if (nb === 7) drawSeven(p, x, y);
		if (nb === 8) drawEight(p, x, y);
		if (nb === 9) drawNine(p, x, y);
	}

	function scoreOne(p: p5, nb: number) {
		p.fill(gameInfo.menuColor);
		p.rect(
			gameInfo.borderSize + gameInfo.numberSideDist,
			gameInfo.borderSize + gameInfo.numberTopDist,
			4 * gameInfo.numberSize,
			7 * gameInfo.numberSize
		);
		p.fill(gameInfo.oneScoreColor);
		drawNumber(
			p,
			nb,
			gameInfo.numberSideDist + gameInfo.borderSize,
			gameInfo.numberTopDist + gameInfo.borderSize
		);
	}

	function scoreTwo(p: p5, nb: number) {
		p.fill(gameInfo.menuColor);
		p.rect(
			gameInfo.xsize -
				gameInfo.borderSize -
				gameInfo.numberSideDist -
				4 * gameInfo.numberSize,
			gameInfo.borderSize + gameInfo.numberTopDist,
			4 * gameInfo.numberSize,
			7 * gameInfo.numberSize
		);
		p.fill(gameInfo.twoScoreColor);
		drawNumber(
			p,
			nb,
			gameInfo.xsize -
				gameInfo.borderSize -
				gameInfo.numberSideDist -
				4 * gameInfo.numberSize,
			gameInfo.numberTopDist + gameInfo.borderSize
		);
	}

	function drawBall(p: p5) {
		p.fill(gameInfo.ballColor);
		p.rect(
			gameInfo.ballx + gameInfo.gamex,
			gameInfo.bally + gameInfo.gamey,
			gameInfo.ballSize,
			gameInfo.ballSize
		);
	}

	let input = 0;

	function move(p: p5) {
		if (input != 1 && p.keyIsDown(p.DOWN_ARROW)) {
			socket.emit("client.input", { direction: "down", isPressed: true });
			input = 1;
			// if (oneBary + barSize < gameysize)
			// oneBary = oneBary + (p.deltaTime / 1000) * barSpeed;
		} else if (input != 2 && p.keyIsDown(p.UP_ARROW)) {
			socket.emit("client.input", { direction: "up", isPressed: true });
			input = 2;
			// if (oneBary > 0)
			// oneBary = oneBary - (p.deltaTime / 1000) * barSpeed;
		} else if (input == 0) {
			socket.emit("client.input", { direction: null, isPressed: false });
			input = -1;
		}
	}

	function drawMenuBar(p: p5) {
		p.fill(gameInfo.borderColor);
		p.rect(
			gameInfo.borderSize,
			gameInfo.menuSize + gameInfo.borderSize,
			gameInfo.xsize - 2 * gameInfo.borderSize,
			gameInfo.borderSize
		);
	}

	function drawMenu(p: p5) {
		p.fill(gameInfo.menuColor);
		p.rect(
			gameInfo.borderSize,
			gameInfo.borderSize,
			gameInfo.xsize - 2 * gameInfo.borderSize,
			gameInfo.menuSize
		);
	}

	function drawEmpty(p: p5) {
		p.background(gameInfo.backgroundColor);
		drawMenu(p);
		drawBorder(p);
		drawMenuBar(p);
		drawBoardMidline(p);
		drawMenuMidline(p);
	}

	function clearBoard(p: p5) {
		p.fill(gameInfo.backgroundColor);
		p.rect(
			gameInfo.borderSize,
			gameInfo.menuSize + gameInfo.borderSize * 2,
			gameInfo.xsize - 2 * gameInfo.borderSize,
			gameInfo.ysize - gameInfo.borderSize * 3 - gameInfo.menuSize
		);
		p.rect(
			gameInfo.borderSize,
			gameInfo.menuSize + gameInfo.borderSize * 2,
			gameInfo.xsize - 2 * gameInfo.borderSize,
			gameInfo.ysize - gameInfo.borderSize * 3 - gameInfo.menuSize
		);
	}

	const myRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (myRef.current) {
			socket.on("server.previewUpdate", onUpdate);
			const myP5 = new p5(Sketch, myRef.current);
			return () => {
				myP5.remove();
				socket.off("server.previewUpdate", onUpdate);
			};
		}

		function onUpdate(gameUpdate: gameInfoDto) {
			const updatedObject = {
				...gameInfo,
				...gameUpdate,
				xsize: gameUpdate.gamexsize + 2 * gameUpdate.borderSize,
				ysize:
					gameUpdate.gameysize +
					3 * gameUpdate.borderSize +
					gameUpdate.menuSize,
				gamex: gameUpdate.borderSize,
				gamey: gameUpdate.borderSize * 2 + gameUpdate.menuSize,
			};
			setGameInfo(updatedObject);
		}
	}, [gameInfo]);

	const Sketch = (p: p5) => {
		p.setup = () => {
			p.createCanvas(gameInfo.xsize, gameInfo.ysize);
			p.frameRate(30);
			p.noStroke();
			drawEmpty(p);
			drawBar(p);
			scoreOne(p, gameInfo.oneScore);
			scoreTwo(p, gameInfo.twoScore);
		};
		p.draw = () => {
			p.resizeCanvas(gameInfo.xsize, gameInfo.ysize); //margot
			drawEmpty(p);
			drawBar(p);
			scoreOne(p, gameInfo.oneScore);
			scoreTwo(p, gameInfo.twoScore);
			move(p);
			clearBoard(p);
			drawBar(p);
			drawBall(p);
			drawBoardMidline(p);
			scoreOne(p, gameInfo.oneScore);
			scoreTwo(p, gameInfo.twoScore);
		};
		p.keyReleased = () => {
			input = 0;
		};
	};
	return (
		<div className="Pong" id="canva">
			<div ref={myRef}></div>
		</div>
	);
}
