import "./JoinCustom.css";
import { useEffect, useState } from "react";
import { gameInfoDto } from "shared/src/gameInfo.dto";
import { socket } from "../../../socket";
import store from "../../../store";
import { addWindow, delWindow } from "../../../reducers";
import { SearchBar } from "../../../shared/ui-components/SearchBar/SearchBar";
import List from "../../../shared/ui-components/List/List";
import { Button } from "../../../shared/ui-components/Button/Button";
import { HBButton, WinColor } from "../../../shared/utils/WindowTypes";
interface joinCustomProps {
	onJoinCustom: () => void;
}
export default function JoinCustom(props: joinCustomProps) {
	const [lobbies, setLobbies] = useState<gameInfoDto[]>([]);
	const [joinLobbyClick, setJoinLobbyClick] = useState<boolean>(false);
	const [placeHolderValue, setPlaceHolderValue] = useState<string>("");
	function joinLobbyOnClick() {
		props.onJoinCustom();
		setJoinLobbyClick(true);
	}
	useEffect(() => {
		function onLobbies(lol: gameInfoDto) {
			setLobbies([...lobbies, lol]);
		}
		function onLobbiesDelete(lol: gameInfoDto) {
			const index = lobbies.findIndex((value) => {
				return value.name === lol.name;
			});
			if (index !== -1) {
				const temp: gameInfoDto[] = [...lobbies];
				temp.splice(index, 1);
				setLobbies(temp);
			}
		}
		socket.on("server.lobbyCustom", onLobbies);
		socket.on("server.lobbyCustomDelete", onLobbiesDelete);

		return () => {
			const memberSettingsWindow = store
				.getState()
				.windows.find((window) => window.content.type === "PREVIEW");
			if (memberSettingsWindow) {
				store.dispatch(delWindow(memberSettingsWindow.id));
			}
			if (joinLobbyClick === false) {
				socket.emit("client.closeJoinCustom");
			}
		};
	}, [lobbies, joinLobbyClick]);

	const handleButtonPreview = (gameInfo: gameInfoDto) => {
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
		socket.emit("client.previewUpdate", gameInfo);
	};

	const handleButtonJoin = (gameInfo: gameInfoDto) => {
		joinLobbyOnClick();
		socket.emit("client.joinMatch", gameInfo.id);
	};

	return (
		<div className="JoinCustom">
			<SearchBar
				action={setPlaceHolderValue}
				button={{ color: "purple", icon: "Lens" }}
			/>
			<List dark={false}>
				{lobbies.map((i, index) => {
					if (
						placeHolderValue.length > 0 &&
						!i.name
							.toLowerCase()
							.includes(placeHolderValue.toLowerCase())
					)
						return null;
					return (
						<div className="CustomGameRow" key={index}>
							<div className="Frame">
								<div className="Player">
									<div className="PlayerName">{i.name}</div>
								</div>
								<div className="Buttons">
									<Button
										color="pink"
										content="preview"
										type="button"
										onClick={() => handleButtonPreview(i)}
									/>
									<Button
										color="blue"
										content="join"
										type="button"
										onClick={() => handleButtonJoin(i)}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</List>
		</div>
	);
}
