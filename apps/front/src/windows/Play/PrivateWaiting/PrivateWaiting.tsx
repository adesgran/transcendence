import { Button } from "../../../shared/ui-components/Button/Button";
import "./PrivateWaiting.css";

interface waitingProps {
  onPrivateAbort: () => void;
}
export default function PrivateWaiting(props: waitingProps) {
  return (
    <div className="PrivateWaiting">
      Waiting for the other player to respond...
      <Button
        type="button"
        color="red"
        content="Cancel request"
        onClick={props.onPrivateAbort}
      />
    </div>
  );
}
