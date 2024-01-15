import { useEffect, useState } from "react"
import { gameInfoDto } from "shared/src/gameInfo.dto";
import Boutton from "./Boutton";
import { socket } from "../../../socket";

export default function JoinCustom()
{
	const [lobbies, setLobbies] = useState<gameInfoDto[]>([]);
	useEffect(() => {
		function onLobbies(lol: gameInfoDto) {
			setLobbies([...lobbies, lol]);
		}
		socket.on("server.lobbyCustom", onLobbies);

		return () => {
		};
	}, [lobbies]);
	return(
		<div className="JoinCustom">{lobbies.map((i, index)=><div key={index} className='lobbiesEle'><Boutton gameInfo={i} /></div>)}</div>
	)
}