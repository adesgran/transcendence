import * as React from 'react';
import './RatioSelector.css';

interface ratioProps{
	name: string,
	value: number,
	label: string;
	setValue: (name: string, value: number | string) => void;
}

export default function RatioSelector(props: ratioProps) {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.setValue(props.name, e.target.value);
  };

	return (
		<div className="frame-ratio-selector"> 
			<div className= "label-ratio-selector" >{props.label}</div>
			<select onChange={(e) => handleChange(e)}>
				<option value={'2/1'}>2/1</option>
				<option value={'4/3'}>4/3</option>
				<option value={'3/4'}>3/4</option>
				<option value={'1/2'}>1/2</option>
			</select>
		</div>

	);
}



