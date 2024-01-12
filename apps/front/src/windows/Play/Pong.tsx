import "./Pong.css";
import { useEffect, useRef } from "react";
import p5 from "p5";
import { socket } from "../../socket";
import { gameInfo } from "./dto/gameInfo.interface.ts";
import { gameInfoDto } from "./dto/gameInfo.dto.ts";

interface scaleInfo {
		yborderSize: number,
		xborderSize: number,
		ynumberSize: number,
		xnumberSize: number,
		yitemSize: number,
		xitemSize: number,
		xballSize: number,
		yballSize: number,
}
interface pongProps {
	gameInfo: gameInfo;
}

export default function Pong(props: pongProps) {
	const defaultGameInfo = {
			ballSize: props.gameInfo.ballSize,
			barSize: props.gameInfo.barSize,
			xsize: props.gameInfo.xsize,
			ysize: props.gameInfo.ysize,
			oneBarColor: props.gameInfo.oneBarColor,
			twoBarColor: props.gameInfo.twoBarColor,
			ballColor: props.gameInfo.ballColor,
			backgroundColor: props.gameInfo.backgroundColor,
			borderColor: props.gameInfo.borderColor,
			oneNumberColor: props.gameInfo.oneNumberColor,
			twoNumberColor: props.gameInfo.twoNumberColor,
			menuColor: props.gameInfo.menuColor,
			itemSize: props.gameInfo.itemSize,
			oneScore: props.gameInfo.oneScore,
			twoScore: props.gameInfo.twoScore,
			ballSpeed: props.gameInfo.ballSpeed,
			barDist: props.gameInfo.barDist,
			barSpeed: props.gameInfo.barSpeed,
			barLarge: props.gameInfo.barLarge,
			numberSize: props.gameInfo.numberSize,
			borderSize: props.gameInfo.borderSize,
			menuSize: props.gameInfo.menuSize,
			numberSideDist: props.gameInfo.numberSideDist,
			numberTopDist: props.gameInfo.numberTopDist,
			name: props.gameInfo.name,
			ballDirx: props.gameInfo.ballDirx,
			ballDiry: props.gameInfo.ballDiry,
			ballDeb: props.gameInfo.ballDeb,
			gamey: props.gameInfo.borderSize * 2 + props.gameInfo.menuSize,
			gamex: props.gameInfo.borderSize,
			gamexsize: props.gameInfo.gamexsize,
			gameysize: props.gameInfo.gameysize,
			oneBary: props.gameInfo.oneBary,
			twoBary: props.gameInfo.twoBary,
			ballx: props.gameInfo.ballx,
			bally: props.gameInfo.bally,
			itemx: props.gameInfo.itemx,
			itemy: props.gameInfo.itemy,
	};
	const gameInfo: gameInfo ={
			ballSize: props.gameInfo.ballSize,
			barSize: props.gameInfo.barSize,
			xsize: props.gameInfo.xsize,
			ysize: props.gameInfo.ysize,
			oneBarColor: props.gameInfo.oneBarColor,
			twoBarColor: props.gameInfo.twoBarColor,
			ballColor: props.gameInfo.ballColor,
			backgroundColor: props.gameInfo.backgroundColor,
			borderColor: props.gameInfo.borderColor,
			oneNumberColor: props.gameInfo.oneNumberColor,
			twoNumberColor: props.gameInfo.twoNumberColor,
			menuColor: props.gameInfo.menuColor,
			itemSize: props.gameInfo.itemSize,
			oneScore: props.gameInfo.oneScore,
			twoScore: props.gameInfo.twoScore,
			ballSpeed: props.gameInfo.ballSpeed,
			barDist: props.gameInfo.barDist,
			barSpeed: props.gameInfo.barSpeed,
			barLarge: props.gameInfo.barLarge,
			numberSize: props.gameInfo.numberSize,
			borderSize: props.gameInfo.borderSize,
			menuSize: props.gameInfo.menuSize,
			numberSideDist: props.gameInfo.numberSideDist,
			numberTopDist: props.gameInfo.numberTopDist,
			name: props.gameInfo.name,
			ballDirx: props.gameInfo.ballDirx,
			ballDiry: props.gameInfo.ballDiry,
			ballDeb: props.gameInfo.ballDeb,
			gamey: props.gameInfo.borderSize * 2 + props.gameInfo.menuSize,
			gamex: props.gameInfo.borderSize,
			gamexsize: props.gameInfo.gamexsize,
			gameysize: props.gameInfo.gameysize,
			oneBary: props.gameInfo.oneBary,
			twoBary: props.gameInfo.twoBary,
			ballx: props.gameInfo.ballx,
			bally: props.gameInfo.bally,
			itemx: props.gameInfo.itemx,
			itemy: props.gameInfo.itemy,
	};
	const scaleInfo: scaleInfo ={
		yborderSize: gameInfo.borderSize,
		xborderSize: gameInfo.borderSize,
		ynumberSize: gameInfo.borderSize,
		xnumberSize: gameInfo.borderSize,
		yitemSize: gameInfo.itemSize,
		xitemSize: gameInfo.itemSize,
		xballSize: gameInfo.ballSize,
		yballSize: gameInfo.ballSize,
	};


function drawBoardMidline(p: p5) {
	p.fill(gameInfo.borderColor);
	let tmp = gameInfo.gameysize / gameInfo.borderSize;
	tmp = Math.floor(tmp);
	tmp = tmp / 2;
	tmp = Math.floor(tmp);
	let i = gameInfo.gamey + (gameInfo.gameysize - gameInfo.borderSize * (tmp * 2 - 1)) / 2;
	while (i < gameInfo.gamey + gameInfo.gameysize - gameInfo.borderSize) {
		p.rect(gameInfo.xsize / 2 - gameInfo.borderSize / 2, i, gameInfo.borderSize, gameInfo.borderSize);
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
	p.rect(0, gameInfo.ysize - gameInfo.borderSize, gameInfo.xsize, gameInfo.borderSize);
	p.rect(0, gameInfo.borderSize, gameInfo.borderSize, gameInfo.ysize - 2 * gameInfo.borderSize);
	p.rect(gameInfo.xsize - gameInfo.borderSize, gameInfo.borderSize, gameInfo.borderSize, gameInfo.ysize - 2 * gameInfo.borderSize);
}

function drawBar(p: p5) {
	p.fill(gameInfo.oneBarColor);
	p.rect(gameInfo.gamex + gameInfo.barDist, gameInfo.gamey + gameInfo.oneBary, gameInfo.barLarge, gameInfo.barSize);
	p.fill(gameInfo.twoBarColor);
	p.rect(
		gameInfo.gamex + gameInfo.gamexsize - gameInfo.barDist - gameInfo.barLarge,
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
	p.fill(gameInfo.oneNumberColor);
	drawNumber(p, nb, gameInfo.numberSideDist + gameInfo.borderSize, gameInfo.numberTopDist + gameInfo.borderSize);
}

function scoreTwo(p: p5, nb: number) {
	p.fill(gameInfo.menuColor);
	p.rect(
		gameInfo.xsize - gameInfo.borderSize - gameInfo.numberSideDist - 4 * gameInfo.numberSize,
		gameInfo.borderSize + gameInfo.numberTopDist,
		4 * gameInfo.numberSize,
		7 * gameInfo.numberSize
	);
	p.fill(gameInfo.oneNumberColor);
	drawNumber(p, nb, gameInfo.xsize - gameInfo.borderSize - gameInfo.numberSideDist - 4 * gameInfo.numberSize, gameInfo.numberTopDist + gameInfo.borderSize);
}

function drawBall(p: p5) {
	p.fill(gameInfo.ballColor);
	p.rect(gameInfo.ballx + gameInfo.gamex, gameInfo.bally + gameInfo.gamey, gameInfo.ballSize, gameInfo.ballSize);
}

function drawItem(p: p5) {
	p.fill('red');
	p.rect(gameInfo.itemx + gameInfo.gamex, gameInfo.itemy + gameInfo.gamey, gameInfo.itemSize, gameInfo.itemSize);
}

let input = 0;

function move(p: p5) {
	if (input != 1 && p.keyIsDown(p.DOWN_ARROW)) {
		socket.emit("client.input", { direction: "down", isPressed: true });
		input = 1;
	} else if (input != 2 && p.keyIsDown(p.UP_ARROW)) {
		socket.emit("client.input", { direction: "up", isPressed: true });
		input = 2;
	} else if (input == 0) {
		socket.emit("client.input", { direction: null, isPressed: false });
		input = -1;
	}
}

function compteur(p: p5, nb: number) {
	p.fill(gameInfo.borderColor);
	p.circle(gameInfo.xsize / 2, gameInfo.ysize / 2, 150);
	p.fill(gameInfo.backgroundColor);
	p.circle(gameInfo.xsize / 2, gameInfo.ysize / 2, 150 - 10 * 2);
	p.fill("white");
	if (nb != 1)
		drawNumber(
			p,
			nb,
			gameInfo.xsize / 2 - scaleInfo.xborderSize * 2,
			gameInfo.ysize / 2 - scaleInfo.yborderSize * 5.5
		);
	else
		drawNumber(
			p,
			nb,
			gameInfo.xsize / 2 - scaleInfo.xborderSize * 3,
			gameInfo.ysize / 2 - scaleInfo.yborderSize * 5.5
		);
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

function loop(p: p5) {
			move(p);
			clearBoard(p);
			drawBar(p);
			drawBall(p);
			drawBoardMidline(p);
			if (gameInfo.itemSize > 0 && gameInfo.itemSize > 0)
			drawItem(p);
			scoreOne(p, gameInfo.oneScore);
			scoreTwo(p, gameInfo.twoScore);
}

interface sendInfo {
	ballx: number;
	bally: number;
	oneBary: number;
	twoBary: number;
	itemx: number;
	itemy: number;

  barDist: number;
  barLarge: number;
  barSize: number;

  ballSize: number;

  itemSize: number;

  oneScore: number;
  twoScore: number;
}

let height: number | undefined ; //margot changed
let width: number | undefined ;  //margot changed

function onSizeChange(p:p5) {
	width = document.getElementById('canva')?.getBoundingClientRect().width;
	height = document.getElementById('canva')?.getBoundingClientRect().height;
	if (typeof width == typeof 1)// && width !== undefined && height !== undefined) ////margot
	{
		p.resizeCanvas(width as number, height as number); //margot
		gameInfo.xsize = width as number;
		gameInfo.ysize = height as number;
		drawEmpty(p);
		drawBar(p);
		scoreOne(p, gameInfo.oneScore);
		scoreTwo(p, gameInfo.twoScore);
		const xratio = defaultGameInfo.xsize / gameInfo.xsize;
		const yratio = defaultGameInfo.ysize / gameInfo.ysize;

			gameInfo.gamex = defaultGameInfo.gamex / xratio;
			gameInfo.gamey = defaultGameInfo.gamey / yratio;
			gameInfo.gamexsize = defaultGameInfo.gamexsize / xratio;
			gameInfo.gameysize = defaultGameInfo.gameysize / yratio;

			gameInfo.barSize = defaultGameInfo.barSize / yratio;
			gameInfo.barDist = defaultGameInfo.barDist / xratio;
			gameInfo.barLarge = defaultGameInfo.barLarge / xratio;
			gameInfo.menuSize = defaultGameInfo.menuSize / yratio;
			gameInfo.numberSideDist = defaultGameInfo.numberSideDist / xratio;
			gameInfo.numberTopDist = defaultGameInfo.numberTopDist / yratio;
				scaleInfo.xborderSize = defaultGameInfo.borderSize / xratio;
				scaleInfo.yborderSize = defaultGameInfo.borderSize / yratio;
				scaleInfo.xballSize = defaultGameInfo.ballSize / xratio;
				scaleInfo.yballSize = defaultGameInfo.ballSize / yratio;
				scaleInfo.xitemSize = defaultGameInfo.itemSize / xratio;
				scaleInfo.yitemSize = defaultGameInfo.itemSize / yratio;
				scaleInfo.xnumberSize = defaultGameInfo.numberSize / xratio;
				scaleInfo.ynumberSize = defaultGameInfo.numberSize / yratio;

	}
}
	const myRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (myRef.current) {
			socket.on("server.update", onUpdate);
			const myP5 = new p5(Sketch, myRef.current);
			return () => {
				myP5.remove();
				socket.off("server.update", onUpdate);
			};
		}
		function onUpdate(gameUpdate: sendInfo) {
			console.log('fds', gameUpdate.bally);
			const xratio = defaultGameInfo.xsize / gameInfo.xsize;
			const yratio = defaultGameInfo.ysize / gameInfo.ysize;
			gameInfo.barSize = gameUpdate.barSize / yratio;
			gameInfo.barDist = gameUpdate.barDist / xratio;
			gameInfo.barLarge = gameUpdate.barLarge / xratio;
			gameInfo.ballx = gameUpdate.ballx / xratio;
			gameInfo.bally = gameUpdate.bally / yratio;
			gameInfo.oneBary = gameUpdate.oneBary / yratio;
			gameInfo.twoBary = gameUpdate.twoBary / yratio;
			gameInfo.itemx = gameUpdate.itemx / xratio;
			gameInfo.itemy = gameUpdate.itemy / yratio;
			gameInfo.oneScore = gameUpdate.oneScore;
			gameInfo.twoScore = gameUpdate.twoScore;
			scaleInfo.xballSize = gameUpdate.ballSize / xratio;
			scaleInfo.yballSize = gameUpdate.ballSize / yratio;
			scaleInfo.xitemSize = gameUpdate.itemSize / xratio;
			scaleInfo.yitemSize = gameUpdate.itemSize / yratio;
		}
	}, []);

	const Sketch = (p: p5) => {
		p.setup = () => {
			width = document.getElementById('canva')?.getBoundingClientRect().width;
			height = document.getElementById('canva')?.getBoundingClientRect().height;
			p.createCanvas(defaultGameInfo.xsize, defaultGameInfo.ysize); //margot
			p.frameRate(30);
			p.noStroke();
			drawEmpty(p);
			drawBar(p);
			scoreOne(p, defaultGameInfo.oneScore);
			scoreTwo(p, defaultGameInfo.twoScore);
		};
		p.draw = () => {
			// if (document.getElementById('canva')?.getBoundingClientRect().width != width || document.getElementById('canva')?.getBoundingClientRect().height != height) {
				// onSizeChange(p);
			// }
			const ms = p.millis();
			if (ms < 1000) {
				compteur(p, 3);
			}
			// else if (ms < 2000) {
			// 	compteur(p, 2);
			// }
			// else if (ms < 3000) {
			// 	compteur(p, 1);
			// }
			// else if (ms < 3200) {
			// 	compteur(p, 0);
			// }
			else {
				loop(p);
			}
		};
		p.keyReleased = () => {
			input = 0;
		};
	};
	return (
		<div className="Pong" id='canva'>
			<div ref={myRef}></div>
		</div>
	);
}
