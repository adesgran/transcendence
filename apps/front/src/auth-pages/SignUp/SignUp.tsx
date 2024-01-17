import { router } from "../../router";
import { Button } from "../../shared/ui-components/Button/Button";
import "./SignUp.css";
import { useMutation } from "@tanstack/react-query";
import api from "../../axios";
import { Input } from "../../shared/ui-components/Input/Input";
import { AxiosError } from "axios";
import { FormEvent } from "react";

interface ValidationErrorResponse {
  [key: string]: string[];
}

export default function Initialise() {
  const queryParameters = new URLSearchParams(window.location.search);
  const id = queryParameters.get("id");

  const { mutate: postForm, error } = useMutation({
    mutationFn: (formData) => {
      return api
        .post(`/auth/sign-up?id=${id}`, formData)
        .then((response) => response.data.token)
        .catch((error: AxiosError) => {
          if (error.response?.status === 400)
            throw error.response?.data as ValidationErrorResponse;
          else
            throw {
              username: [(error.response?.data as { message: string }).message],
            };
        });
    },
    onSuccess: () => {
      window.location.href = `/api/auth/redirect-to-home?id=${id}`;
    },
  });

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = Object.fromEntries(new FormData(target));
    postForm(formData as any);
  };

  const handleReturn = () => {
    router.navigate({ to: "/auth" });
  };

  const usernameDiv = (
    <Input
      label="Pick a username"
      name="username"
      required
      minLength={3}
      errors={(error as any)?.username}
    ></Input>
  );

  return (
    <>
      <form className="form-signin" onSubmit={handleContinue}>
        {usernameDiv}
        <div className="buttons-signin">
          <Button content="continue" type="submit" color="pink" />
          <Button
            content="return"
            type="button"
            color="red"
            onClick={handleReturn}
          />
        </div>
      </form>
    </>
  );
}
