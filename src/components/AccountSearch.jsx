import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar.tsx";

export default function AccountSearch(properties) {
  const { chain, excludedUsers, setChosenAccount } = properties;

  const [accountInput, setAccountInput] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const [inProgress, setInProgress] = useState(false);
  const [searchResponse, setSearchResponse] = useState();
  async function lookupAccount() {
    const excludedUsernames = excludedUsers.map((user) => user.username);
    const excludedIds = excludedUsers.map((user) => user.id);

    if (
      excludedUsernames.includes(accountInput) ||
      excludedIds.includes(accountInput)
    ) {
      setInProgress(false);
      setErrorMessage("Cannot transfer assets to this account.");
      return;
    }

    const response = await fetch(
      `http://localhost:8080/api/accountLookup/${chain}/${accountInput}`,
      { method: "GET" }
    );

    if (!response.ok) {
      console.log({
        error: new Error(`${response.status} ${response.statusText}`),
        msg: "Couldn't find account.",
      });
      setInProgress(false);
      return;
    }

    const responseContents = await response.json();

    if (responseContents && responseContents.result) {
      const finalResult = responseContents.result;
      setInProgress(false);
      setSearchResponse(finalResult);
      return;
    }

    setInProgress(false);
    setErrorMessage("Couldn't find account.");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {!searchResponse ? (
          <>
            <div className="col-span-1">
              Please enter a blockchain account name
            </div>
            <div className="col-span-1">
              {" "}
              <Input
                value={accountInput || ""}
                placeholder="Account name or ID"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !inProgress) {
                    setInProgress(true);
                    lookupAccount();
                  }
                }}
                onChange={(event) => {
                  const regex = /^[a-zA-Z0-9.-]*$/;
                  if (regex.test(event.target.value)) {
                    setAccountInput(event.target.value);
                    setErrorMessage();
                    setSearchResponse();
                  }
                }}
              />
              {errorMessage ? (
                <p className="text-red-500 text-xs italic">
                  {errorMessage || "ERROR"}
                </p>
              ) : null}
            </div>
            <div className="col-span-1">
              {accountInput && !inProgress ? (
                <Button onClick={() => lookupAccount()}>Continue</Button>
              ) : (
                <Button disabled>Continue</Button>
              )}
            </div>
          </>
        ) : null}
        {searchResponse ? (
          <>
            <div className="col-span-1">
              {chain === "bitshares"
                ? "Proceed with the following Bitshares account?"
                : "Proceed with the following Bitshares testnet (TEST) account?"}
            </div>
            <div className="col-span-1">
              <Card
                key={searchResponse.id}
                className="mb-2 mt-1 text-center"
                onClick={() => {
                  setChosenAccount({
                    name: searchResponse.name,
                    id: searchResponse.id,
                  });
                }}
              >
                <div className="grid grid-cols-4">
                  <div className="col-span-1 pt-6 pl-7">
                    <Avatar
                      size={40}
                      name={searchResponse.name}
                      extra="AS"
                      expression={{
                        eye: "normal",
                        mouth: "open",
                      }}
                      colors={[
                        "#92A1C6",
                        "#146A7C",
                        "#F0AB3D",
                        "#C271B4",
                        "#C20D90",
                      ]}
                    />
                  </div>
                  <div className="col-span-3">
                    <CardHeader>
                      <CardTitle
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {searchResponse.name}
                      </CardTitle>
                      <CardDescription>{searchResponse.id}</CardDescription>
                    </CardHeader>
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-span-1">
              <div className="grid grid-cols-2">
                <div>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => {
                      setErrorMessage();
                      setSearchResponse();
                    }}
                  >
                    Go back
                  </Button>
                </div>
                <div className="text-right">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChosenAccount({
                        name: searchResponse.name,
                        id: searchResponse.id,
                      });
                    }}
                  >
                    Proceed
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
