import { ChangeEvent, KeyboardEvent, useState } from "react";
import "./SearchBar.css";
import { Button } from "../Button/Button";
import { IconSVG } from "../../utils/svgComponent";

interface SearchBarProps {
	action?: (value: string) => void;
	button?: {
		icon?: keyof typeof IconSVG;
		content?: string;
		color: string;
	};
}

export function SearchBar({ action, button }: SearchBarProps) {
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			if (action) action(inputValue);
		}
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	return (
		<div className="SearchBarComponent">
			<input
				className="SearchBarInput"
				type="text"
				value={inputValue}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				placeholder="Type and press Enter"
			/>

			{button && (
				<Button
					className="SearchBarButton"
					color={button.color}
					icon={button.icon}
					content={button.content}
				/>
			)}
		</div>
	);
}
