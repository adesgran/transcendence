import "./GameEnd.css";

type GameEndProps = {
  isVictorious: boolean;
};

export function GameEnd({ isVictorious }: GameEndProps) {
  return (
    <>
      <div className="title-game-end">
        <div className={`label-${isVictorious ? "victory" : "defeat"}`}>
          {isVictorious ? "You Won" : "You Lost"}
        </div>
      </div>
    </>
  );
}
