import "./NewChan.css";
import { Button } from "../../../shared/ui-components/Button/Button";
import { useState, ChangeEvent, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../axios";
import { AxiosResponse, AxiosError } from "axios";
import store from "../../../store";
import { delWindow } from "../../../reducers";

interface ValidationErrorResponse {
  [key: string]: string[];
}

interface NewChanProps {
  winId: number;
}

function NewChan({winId}: NewChanProps) {
  const queryClient = useQueryClient();

  const [selectedOption, setSelectedOption] = useState("PUBLIC");

  const handleOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

	const { mutateAsync: createChannel, error } = useMutation<
		AxiosResponse,
		AxiosError<ValidationErrorResponse>,
		Record<string, FormDataEntryValue>
	>({
		mutationFn: async (param: Record<string, FormDataEntryValue>) => {
			return api.post("/channel", param);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["channels"] });
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = Object.fromEntries(new FormData(target));
    await createChannel(formData);
    store.dispatch(delWindow(winId));
  };

  const dataError = error?.response?.data;

  return (
    <form onSubmit={handleSubmit} className="NewChan">
      <div className="formNewChan custom-scrollbar lilac-list">
        <div className="elFormNewChan">
          <label className="labelFormNewChan">Channel Name:</label>
          <div className="inputErrFormNewChan">
            <input
              className={`inputFormNewChan ${
                dataError?.name ? "errorBorderFormNewChan" : ""
              }`}
              placeholder="Type here"
              name="name"
            ></input>
            {dataError?.name ? (
              <p className="errorFormNewChan">{dataError["name"]}</p>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="elFormNewChan">
          <label className="labelFormNewChan">Topic:</label>
          <div className="inputErrFormNewChan">
            <input
              className={`inputFormNewChan ${
                dataError?.topic ? "errorBorderFormNewChan" : ""
              }`}
              placeholder="Type here"
              name="topic"
            ></input>
            {dataError?.topic ? (
              <p className="errorFormNewChan">{dataError["topic"]}</p>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="elFormNewChan typeFormNewChan">
          <label className="labelFormNewChan">Type:</label>
          <div className="listCheckboxFormNewChan">
            <div className="elFormNewChan">
              <label className="labelCheckboxNewChan">
                <input
                  type="radio"
                  value="PUBLIC"
                  name="type"
                  checked={selectedOption === "PUBLIC"}
                  onChange={handleOptionChange}
                />
                <span className="checkmarkFormNewChan"></span>
              </label>
              <p className="descCheckboxNewChan">PUBLIC</p>
            </div>
            <div className="elFormNewChan">
              <label className="labelCheckboxNewChan">
                <input
                  type="radio"
                  value="PRIVATE"
                  name="type"
                  checked={selectedOption === "PRIVATE"}
                  onChange={handleOptionChange}
                />
                <span className="checkmarkFormNewChan"></span>
              </label>
              <p className="descCheckboxNewChan">PRIVATE</p>
            </div>
            <div className="elFormNewChan">
              <label className="labelCheckboxNewChan">
                <input
                  type="radio"
                  value="PROTECTED"
                  name="type"
                  checked={selectedOption === "PROTECTED"}
                  onChange={handleOptionChange}
                />
                <span className="checkmarkFormNewChan"></span>
              </label>
              <div className="pwdProtectedNewChan">
                <p className="descCheckboxNewChan">PASSWORD PROTECTED</p>
                <div
                  className={`passwordNewChan ${
                    selectedOption !== "PROTECTED" ? "passwordHidden" : ""
                  }`}
                >
                  <div className="passwordInputNewChan">
                    <label className="descInputNewChan">CHOOSE PASSWORD:</label>
                    <div className="inputErrFormNewChan">
                      <input
                        className={`inputFormNewChan ${
                          dataError?.password ? "errorBorderFormNewChan" : ""
                        }`}
                        placeholder="Type here"
                        type="password"
                        name="password"
                      ></input>
                      {dataError?.password ? (
                        <p className="errorFormNewChan">
                          {dataError["password"]}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="passwordInputNewChan">
                    <label className="descInputNewChan">
                      ENTER SAME PASSWORD:
                    </label>

                    <div className="inputErrFormNewChan">
                      <input
                        className={`inputFormNewChan ${
                          dataError?.passwordConfirmation
                            ? "errorBorderFormNewChan"
                            : ""
                        }`}
                        type="password"
                        placeholder="Type here"
                        name="passwordConfirmation"
                      ></input>
                      {dataError?.passwordConfirmation ? (
                        <p className="errorFormNewChan">
                          {dataError["passwordConfirmation"]}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {dataError?.type ? (
              <p className="errorFormNewChan">{dataError["type"]}</p>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <Button content="create" color="purple" type="submit" />
    </form>
  );
}

export default NewChan;
