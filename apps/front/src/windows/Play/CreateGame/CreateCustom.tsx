import { useEffect, useState } from "react";
import "./CreateCustom.css";
import ColorSelector from "./ColorSelector";
import { gameInfo } from "shared/src/gameInfo.interface";
import { normalGameInfo } from "shared/src/normalGameInfo";
import { socket } from "../../../socket";
import { HBButton, WinColor } from "../../../shared/utils/WindowTypes";
import store from "../../../store";
import RangeSlider from "./RangeSlider";
import { addWindow, delWindow } from "../../../reducers";
import CheckboxComponent from "./CheckboxComponent";
import { Button } from "../../../shared/ui-components/Button/Button";

interface createCustomProps {
	onCreateLobby: () => void;
	returnToMenu: () => void;
}

export default function CreateCustom(props: createCustomProps) {
	const [interfaceDisplay, setInterfaceDisplay] = useState<boolean>(false);
	const [gameDisplay, setGameDisplay] = useState<boolean>(true);
	const [PowerUpDisplay, setPowerUpDisplay] = useState<boolean>(false);

	const [relativeGameInfo, setRelativeGameInfo] = useState<gameInfo>({
		...normalGameInfo,
		numberSize: 100,
		barLarge: 1.25,
		menuSize: 25,
		numberTopDist: 2.5,
		numberSideDist: 2.5,
		ballSize: 2.6,
		ballSpeed: 0.5,
		barSize: 25,
		barDist: 2.5,
		barSpeed: 0.25,
		name: "My Custom Game",
	});
	const [absoluteGameInfo, setAbsoluteGameInfo] =
		useState<gameInfo>(normalGameInfo);

	const setValue = (name: string, value: number | string) => {
		setRelativeGameInfo((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const setAbsoluteValue = () => {
		setAbsoluteGameInfo(() => ({
			...relativeGameInfo,
			barLarge:
				(relativeGameInfo.barLarge * relativeGameInfo.gamexsize) / 100,
			menuSize:
				(relativeGameInfo.menuSize * relativeGameInfo.gameysize) / 100,
			numberSize:
				(relativeGameInfo.numberSize *
					(relativeGameInfo.gameysize * relativeGameInfo.menuSize)) /
				100000,
			numberTopDist:
				(relativeGameInfo.numberTopDist *
					Math.min(
						relativeGameInfo.gamexsize,
						relativeGameInfo.gameysize
					)) /
				100,
			numberSideDist:
				(relativeGameInfo.numberSideDist *
					Math.min(
						relativeGameInfo.gamexsize,
						relativeGameInfo.gameysize
					)) /
				100,
			ballSize:
				(relativeGameInfo.ballSize *
					Math.min(
						relativeGameInfo.gamexsize,
						relativeGameInfo.gameysize
					)) /
				100,
			ballSpeed:
				(relativeGameInfo.ballSpeed * relativeGameInfo.gamexsize) / 100,
			barSize:
				(relativeGameInfo.barSize * relativeGameInfo.gameysize) / 100,
			barDist:
				(relativeGameInfo.barDist * relativeGameInfo.gamexsize) / 100,
			barSpeed:
				(relativeGameInfo.barSpeed * relativeGameInfo.gamexsize) / 100,
		}));
	};

	function PowerUpDisplayOnClick() {
		setInterfaceDisplay(false);
		setPowerUpDisplay(true);
		setGameDisplay(false);
	}
	function InterfaceDisplayOnClick() {
		setInterfaceDisplay(true);
		setPowerUpDisplay(false);
		setGameDisplay(false);
	}
	function GameDisplayOnClick() {
		setInterfaceDisplay(false);
		setPowerUpDisplay(false);
		setGameDisplay(true);
	}

	useEffect(() => {
		setAbsoluteValue();
	}, [relativeGameInfo]);

	useEffect(() => {
		socket.emit("client.previewUpdate", absoluteGameInfo);
		return () => {};
	}, [absoluteGameInfo]);
	function PreviewOnClick() {
		const memberSettingsWindow = store
			.getState()
			.windows.find((window) => window.content.type === "PREVIEW");
		if (memberSettingsWindow) {
			store.dispatch(delWindow(memberSettingsWindow.id));
		}
		const newWindow = {
			WindowName: "PREVIEW",
			width: "900",
			height: "900",
			id: 0,
			content: { type: "PREVIEW" },
			toggle: true,
			handleBarButton:
				HBButton.Reduce + HBButton.Enlarge + HBButton.Close,
			color: WinColor.PURPLE,
		};
		store.dispatch(addWindow(newWindow));
		socket.emit("client.previewUpdate", absoluteGameInfo);
	}
	function onCreateLobby() {
		const memberSettingsWindow = store
			.getState()
			.windows.find((window) => window.content.type === "PREVIEW");
		if (memberSettingsWindow) {
			store.dispatch(delWindow(memberSettingsWindow.id));
		}
		props.onCreateLobby();
		socket.emit("client.createCustom", absoluteGameInfo);
	}

	return (
		<div className="create-custom">
			<div className="header-createcustom">
				<div className="tabs-header-createcustom">
					<Button
						color="purple"
						content="GAME"
						onClick={GameDisplayOnClick}
					/>
					<Button
						color="purple"
						content="INTERFACE"
						onClick={InterfaceDisplayOnClick}
					/>
				</div>
				<div className="preview-header-createcustom">
					<Button
						color="pink"
						content="PREVIEW"
						onClick={PreviewOnClick}
					/>
				</div>
			</div>
			{interfaceDisplay === true && (
				<div className="body-custom">
					<ColorSelector
						name={"oneBarColor"}
						value={relativeGameInfo.oneBarColor}
						setValue={setValue}
						label="P1 Bar"
					/>
					<ColorSelector
						name={"twoBarColor"}
						value={relativeGameInfo.twoBarColor}
						setValue={setValue}
						label="P2 Bar"
					/>
					<ColorSelector
						name={"borderColor"}
						value={relativeGameInfo.borderColor}
						setValue={setValue}
						label="Border"
					/>
					<ColorSelector
						name={"oneScoreColor"}
						value={relativeGameInfo.oneScoreColor}
						setValue={setValue}
						label="P1 Score"
					/>
					<ColorSelector
						name={"twoScoreColor"}
						value={relativeGameInfo.twoScoreColor}
						setValue={setValue}
						label="P2 Score"
					/>
					<ColorSelector
						name={"ballColor"}
						value={relativeGameInfo.ballColor}
						setValue={setValue}
						label="Ball"
					/>
					<ColorSelector
						name={"backgroundColor"}
						value={relativeGameInfo.backgroundColor}
						setValue={setValue}
						label="Background"
					/>
					<ColorSelector
						name={"menuColor"}
						value={relativeGameInfo.menuColor}
						setValue={setValue}
						label="Menu"
					/>
					<RangeSlider
						name={"borderSize"}
						value={relativeGameInfo.borderSize}
						setValue={setValue}
						min={5}
						max={100}
						step={5}
						label="Border Size"
					/>
					<RangeSlider
						name={"numberSize"}
						value={relativeGameInfo.numberSize}
						setValue={setValue}
						min={50}
						max={100}
						step={5}
						label="Score Size (%)"
					/>

					<RangeSlider
						name={"barLarge"}
						value={relativeGameInfo.barLarge}
						setValue={setValue}
						min={0.5}
						max={5}
						step={0.25}
						label="Bar Width (%)"
					/>

					<RangeSlider
						name={"menuSize"}
						value={relativeGameInfo.menuSize}
						setValue={setValue}
						min={10}
						max={40}
						step={5}
						label="Menu Size (%)"
					/>

					<RangeSlider
						name={"numberTopDist"}
						value={relativeGameInfo.numberTopDist}
						setValue={setValue}
						min={0.5}
						max={5}
						step={0.5}
						label="Score Top Dist (%)"
					/>

					<RangeSlider
						name={"numberSideDist"}
						value={relativeGameInfo.numberSideDist}
						setValue={setValue}
						min={0.5}
						max={5}
						step={0.5}
						label="SCcore Side Dist (%)"
					/>
				</div>
			)}
			{gameDisplay === true && (
				<div className="body-custom">
					<div className="frame-name">
						<div className="label-name"> Name </div>
						<input
							className="placeholder-name"
							value={relativeGameInfo.name}
							onChange={(e) => setValue("name", e.target.value)}
						/>
					</div>
					<RangeSlider
						name={"gamexsize"}
						value={relativeGameInfo.gamexsize}
						setValue={setValue}
						min={400}
						max={1000}
						step={50}
						label="Game Width"
					/>
					<RangeSlider
						name={"gameysize"}
						value={relativeGameInfo.gameysize}
						setValue={setValue}
						min={300}
						max={1000}
						step={50}
						label="Game Height"
					/>
					<RangeSlider
						name={"ballSize"}
						value={relativeGameInfo.ballSize}
						setValue={setValue}
						min={0.5}
						max={20}
						step={0.5}
						label="Ball Size"
					/>
					<RangeSlider
						name={"ballSpeed"}
						value={relativeGameInfo.ballSpeed}
						setValue={setValue}
						min={0.25}
						max={2}
						step={0.25}
						label="Ball Speed"
					/>
					<RangeSlider
						name={"barSize"}
						value={relativeGameInfo.barSize}
						setValue={setValue}
						min={5}
						max={50}
						step={5}
						label="Bar Size"
					/>

					<RangeSlider
						name={"barDist"}
						value={relativeGameInfo.barDist}
						setValue={setValue}
						min={2.5}
						max={30}
						step={2.5}
						label="Bar Distance"
					/>
					<RangeSlider
						name={"barSpeed"}
						value={relativeGameInfo.barSpeed}
						setValue={setValue}
						min={1}
						max={5}
						step={0.5}
						label="Bar Speed"
					/>
					<RangeSlider
						name={"oneScore"}
						value={relativeGameInfo.oneScore}
						setValue={setValue}
						min={0}
						max={8}
						step={1}
						label="Player One Begin Score"
					/>
					<RangeSlider
						name={"twoScore"}
						value={relativeGameInfo.twoScore}
						setValue={setValue}
						min={0}
						max={8}
						step={1}
						label="Player Two Begin Score"
					/>
				</div>
			)}
			<div className="footer-createcustom">
				<Button
					color="red"
					content="GO BACK"
					onClick={props.returnToMenu}
				/>
				<div className="div-footer-createcustom">
					<div className="button-rainbow" onClick={onCreateLobby}>
						PLAY
					</div>
				</div>
			</div>
		</div>
	);
}
