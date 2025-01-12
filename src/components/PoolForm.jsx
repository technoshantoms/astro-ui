import React, { useState, useEffect, useSyncExternalStore } from "react";
import Fuse from "fuse.js";
import { useForm } from "react-hook-form";
import { FixedSizeList as List } from "react-window";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  blockchainFloat,
  copyToClipboard,
  humanReadableFloat,
} from "../lib/common";

import { eraseCurrentUser } from "../stores/users.ts";
import {
  $poolCache,
  $marketSearchCache,
  $globalParamsCache,
  $assetCache,
  resetCache,
} from "../stores/cache.ts";

import {
  fetchDynamicData,
  fetchBitassetData,
  fetchCachedAsset,
} from "../effects/Market.ts";

import { useInitCache } from "../effects/Init.ts";
import { $currentUser } from "../stores/users.ts";

import AccountSelect from "./AccountSelect.jsx";
import PoolDialogs from "./Market/PoolDialogs.jsx";
import MarketAssetCard from "./Market/MarketAssetCard.jsx";
import CurrentUser from "./common/CurrentUser.jsx";

export default function PoolForm() {
  const form = useForm({
    defaultValues: {
      account: "",
    },
  });

  const [data, setData] = useState(""); // form data container
  const [pool, setPool] = useState(""); // dropdown selected pool

  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );

  useInitCache(usr && usr.chain ? usr.chain : "bitshares");

  const assets = useSyncExternalStore(
    $assetCache.subscribe,
    $assetCache.get,
    () => true
  );

  const pools = useSyncExternalStore(
    $poolCache.subscribe,
    $poolCache.get,
    () => true
  );

  const marketSearch = useSyncExternalStore(
    $marketSearchCache.subscribe,
    $marketSearchCache.get,
    () => true
  );

  const globalParams = useSyncExternalStore(
    $globalParamsCache.subscribe,
    $globalParamsCache.get,
    () => true
  );

  const [fee, setFee] = useState(0);
  useEffect(() => {
    if (globalParams && globalParams.parameters) {
      const current_fees = globalParams.parameters.current_fees.parameters;
      const foundFee = current_fees.find((x) => x[0] === 63);
      setFee(humanReadableFloat(foundFee[1].fee, 5));
    }
  }, [globalParams]);

  // Search dialog

  const [poolSearch, setPoolSearch] = useState();
  const [activeTab, setActiveTab] = useState("asset");
  useEffect(() => {
    if (!pools || !pools.length) {
      return;
    }
    const _poolSearch = new Fuse(pools ?? [], {
      includeScore: true,
      threshold: 0.2,
      keys:
        activeTab === "asset"
          ? ["asset_a_symbol", "asset_b_symbol"]
          : ["share_asset_symbol"],
    });
    setPoolSearch(_poolSearch);
  }, [pools, activeTab]);

  const [thisInput, setThisInput] = useState();
  const [thisResult, setThisResult] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (poolSearch && thisInput) {
      const result = poolSearch.search(thisInput);
      setThisResult(result);
    }
  }, [poolSearch, thisInput]);

  const PoolRow = ({ index, style }) => {
    const res = thisResult[index].item;

    return (
      <div
        style={{ ...style }}
        className="grid grid-cols-12"
        key={`acard-${res.id}`}
        onClick={() => {
          setPool(res.id);
          setDialogOpen(false);
          setThisResult();
        }}
      >
        <div className="col-span-2">{res.id}</div>
        <div className="col-span-3">{res.share_asset_symbol}</div>
        <div className="col-span-3">
          {res.asset_a_symbol} ({res.asset_a_id})
        </div>
        <div className="col-span-3">
          {res.asset_b_symbol} ({res.asset_b_id})
        </div>
        <div className="col-span-1">{res.taker_fee_percent / 100}%</div>
      </div>
    );
  };

  const activeTabStyle = {
    backgroundColor: "#252526",
    color: "white",
  };

  // End of Search dialog

  useEffect(() => {
    async function parseUrlParams() {
      if (window.location.search) {
        console.log("Parsing url params");
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        const poolParameter = params && params.pool ? params.pool : null;

        if (!poolParameter || !poolParameter.length) {
          console.log("No pool parameter found");
          setPool("1.19.0");
          return;
        }

        if (poolParameter & !poolParameter.includes("1.9.")) {
          console.log("Invalid pool parameters");
          setPool("1.19.0");
          return;
        }

        const poolIds = pools && pools.length ? pools.map((x) => x.id) : [];
        if (!poolIds.includes(poolParameter)) {
          console.log("Replacing unknown pool with first pool in list");
          setPool("1.19.0");
          return;
        }

        setPool(poolParameter);
      }
    }

    if (pools && pools.length) {
      parseUrlParams();
    }
  }, [pools]);

  const [sellAmount, setSellAmount] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);

  const [foundPool, setFoundPool] = useState();
  const [assetA, setAssetA] = useState("");
  const [assetB, setAssetB] = useState("");
  useEffect(() => {
    // Setting various react states as the user interacts with the form
    if (pools && pool && assets) {
      const currentPool = pools.find((x) => x.id === pool);
      setFoundPool(currentPool);
      const foundA = assets.find((x) => x.id === currentPool.asset_a_id);
      const foundB = assets.find((x) => x.id === currentPool.asset_b_id);
      setAssetA(foundA);
      setAssetB(foundB);
      setSellAmount(1);
    }
  }, [pool, assets]);

  const [foundPoolDetails, setFoundPoolDetails] = useState();
  useEffect(() => {
    async function lookupPool(chain) {
      const response = await fetch(
        `http://localhost:8080/api/getObjects/${chain}`,
        { method: "POST", body: JSON.stringify([foundPool.id]) }
      );

      if (!response.ok) {
        console.log("Failed to fetch fee data");
        return;
      }

      const responseContents = await response.json();

      if (
        responseContents &&
        responseContents.result &&
        responseContents.result.length
      ) {
        let finalResult = responseContents.result[0];
        finalResult["asset_a_symbol"] = assetA.symbol;
        finalResult["asset_a_precision"] = assetA.precision;

        finalResult["asset_b_symbol"] = assetB.symbol;
        finalResult["asset_b_precision"] = assetB.precision;

        finalResult["share_asset_symbol"] = foundPool.share_asset_symbol;

        finalResult["readable_balance_a"] = `${humanReadableFloat(
          finalResult.balance_a,
          assetA.precision
        )} ${assetA.symbol}`;
        finalResult["readable_balance_b"] = `${humanReadableFloat(
          finalResult.balance_b,
          assetB.precision
        )} ${assetB.symbol}`;
        finalResult["share_asset_details"] = assets.find(
          (x) => x.id === finalResult.share_asset
        );

        setFoundPoolDetails(finalResult);
      }
    }
    if (usr && usr.chain && foundPool) {
      lookupPool(usr.chain);
    }
  }, [usr, foundPool]);

  const [assetADetails, setAssetADetails] = useState(null);
  const [assetBDetails, setAssetBDetails] = useState(null);
  const [poolShareDetails, setPoolShareDetails] = useState(null);

  const [aBitassetData, setABitassetData] = useState(null);
  const [bBitassetData, setBBitassetData] = useState(null);

  useEffect(() => {
    if (usr && usr.id && assetA && assetB && foundPool) {
      fetchDynamicData(
        usr.chain,
        assetA.id.replace("1.3.", "2.3."),
        setAssetADetails
      );
      fetchDynamicData(
        usr.chain,
        assetB.id.replace("1.3.", "2.3."),
        setAssetBDetails
      );
      fetchDynamicData(
        usr.chain,
        assets
          .find((x) => x.symbol === foundPool.share_asset_symbol)
          .id.replace("1.3.", "2.3."),
        setPoolShareDetails
      );

      if (assetA.bitasset_data_id) {
        fetchBitassetData(usr.chain, assetA.bitasset_data_id, setABitassetData);
      }

      if (assetB.bitasset_data_id) {
        fetchBitassetData(usr.chain, assetB.bitasset_data_id, setBBitassetData);
      }
    }
  }, [usr, assetA, assetB, foundPool]);

  const [usrBalances, setUsrBalances] = useState();
  useEffect(() => {
    async function fetchBalances(chain, accountID) {
      const retrievedBalances = await fetch(
        `http://localhost:8080/api/getAccountBalances/${chain}/${accountID}`,
        { method: "GET" }
      );

      if (!retrievedBalances.ok) {
        console.log(`Failed to retrieve user balances`);
        return;
      }

      const balanceJSON = await retrievedBalances.json();

      if (balanceJSON && balanceJSON.result) {
        console.log(`Fetched user balances`);
        setUsrBalances(balanceJSON.result);
      }
    }

    if (usr && usr.id && assetA && assetB) {
      fetchBalances(usr.chain, usr.id);
    }
  }, [usr, assetA, assetB]);

  useEffect(() => {
    // Calculating the amount the user can buy
    if (assetA && assetB && foundPoolDetails) {
      console.log("Calculating the amount the user can buy");

      let poolamounta = Number(foundPoolDetails.balance_a);
      let poolamountap = Number(10 ** assetA.precision);

      let poolamountb = Number(foundPoolDetails.balance_b);
      let poolamountbp = Number(10 ** assetB.precision);

      const maker_market_fee_percenta = assetA.market_fee_percent;
      const maker_market_fee_percentb = assetB.market_fee_percent;

      const max_market_feea = assetA.max_market_fee;
      const max_market_feeb = assetB.max_market_fee;

      const taker_fee_percenta = foundPoolDetails.taker_fee_percent;

      function flagsa() {
        if (maker_market_fee_percenta === 0) {
          return 0;
        }
        if (maker_market_fee_percenta > 0) {
          return Math.min(
            Number(max_market_feea),
            Math.ceil(
              Number(sellAmount) *
                Number(poolamountap) *
                (Number(maker_market_fee_percenta) / 10000)
            )
          );
        }
      }

      function flagsb() {
        if (maker_market_fee_percentb === 0) {
          return 0;
        }
        if (maker_market_fee_percentb > 0) {
          return Math.min(
            Number(max_market_feeb),
            Math.ceil(
              Number(sellAmount) *
                Number(poolamountbp) *
                (Number(maker_market_fee_percentb) / 10000)
            )
          );
        }
      }

      function taker_market_fee_percenta() {
        if (
          typeof taker_fee_percenta == "undefined" &&
          maker_market_fee_percenta > 0
        ) {
          return Number(maker_market_fee_percenta) / 10000;
        }
        if (
          typeof taker_fee_percenta == "undefined" &&
          maker_market_fee_percenta === 0
        ) {
          return 0;
        } else {
          return Number(taker_fee_percenta) / 10000;
        }
      }
      let taker_market_fee_percent_a = Number(taker_market_fee_percenta());

      let result;
      if (assetA.id === foundPool.asset_a_id) {
        let tmp_delta_b =
          Number(poolamountb) -
          Math.ceil(
            (Number(poolamountb) * Number(poolamounta)) /
              (Number(poolamounta) +
                (Number(sellAmount) * Number(poolamountap) - Number(flagsa())))
          );
        let tmp_b = (Number(tmp_delta_b) * Number(taker_fee_percenta)) / 10000;
        result =
          (Number(tmp_delta_b) -
            Math.floor(Number(tmp_b)) -
            Math.ceil(
              Math.min(
                Number(max_market_feeb),
                Math.ceil(
                  Number(tmp_delta_b) * Number(taker_market_fee_percent_a)
                )
              )
            )) /
          Number(poolamountbp);
      } else {
        let tmp_delta_a =
          Number(poolamounta) -
          Math.ceil(
            (Number(poolamounta) * Number(poolamountb)) /
              (Number(poolamountb) +
                (Number(sellAmount) * Number(poolamountbp) - Number(flagsb())))
          );
        let tmp_a = (Number(tmp_delta_a) * Number(taker_fee_percenta)) / 10000;
        result =
          (Number(tmp_delta_a) -
            Math.floor(Number(tmp_a)) -
            Math.ceil(
              Math.min(
                Number(max_market_feea),
                Math.ceil(
                  Number(tmp_delta_a) * Number(taker_market_fee_percent_a)
                )
              )
            )) /
          Number(poolamountap);
      }

      setBuyAmount(result);
    }
  }, [sellAmount, assetA, assetB, foundPoolDetails]);

  const [downloadClicked, setDownloadClicked] = useState(false);

  const handleDownloadClick = () => {
    if (!downloadClicked) {
      setDownloadClicked(true);
      setTimeout(() => {
        setDownloadClicked(false);
      }, 10000);
    }
  };

  const [deeplink, setDeeplink] = useState("");
  const [trxJSON, setTRXJSON] = useState();
  const [deepLinkInProgress, setDeepLinkInProgress] = useState(false);
  useEffect(() => {
    if (data) {
      /**
       * Generates a deeplink for the pool exchange operation
       */
      async function generate() {
        setDeepLinkInProgress(true);
        const opJSON = [
          {
            account: usr.id,
            pool: pool,
            amount_to_sell: {
              amount: blockchainFloat(sellAmount, assetA.precision),
              asset_id: assetA.id,
            },
            min_to_receive: {
              amount: blockchainFloat(buyAmount, assetB.precision),
              asset_id: assetB.id,
            },
            extensions: [],
          },
        ];
        setTRXJSON(opJSON);

        const response = await fetch(
          `http://localhost:8080/api/deeplink/${usr.chain}/liquidity_pool_exchange`,
          {
            method: "POST",
            body: JSON.stringify(opJSON),
          }
        );

        if (!response.ok) {
          console.log({
            error: new Error(`${response.status} ${response.statusText}`),
            msg: "Couldn't generate deeplink.",
          });
          return;
        }

        const deeplinkValue = await response.json();

        if (
          deeplinkValue &&
          deeplinkValue.result &&
          deeplinkValue.result.generatedDeepLink
        ) {
          setDeeplink(deeplinkValue.result.generatedDeepLink);
        }
        setDeepLinkInProgress(false);
      }

      generate();
    }
  }, [data, assetA, assetB]);

  const [buyAmountInput, setBuyAmountInput] = useState();
  useEffect(() => {
    setBuyAmountInput(
      <Input value={buyAmount ?? 0} disabled className="mb-3" />
    );
  }, [buyAmount]);

  const [showDialog, setShowDialog] = useState(false);
  const [poolKey, setPoolKey] = useState("default_pool_key");
  useEffect(() => {
    if (pool && pool.length) {
      window.history.replaceState({}, "", `?pool=${pool}`); // updating the url parameters
    }
    setPoolKey(`pool_key${Date.now()}`);
  }, [pool]);

  const Row = ({ index, style }) => {
    const pool = pools[index];
    return (
      <SelectItem value={pool.id} style={style}>
        {`${pool.id} - ${pool.share_asset_symbol} - ${pool.asset_a_symbol}:${pool.asset_b_symbol}`}
      </SelectItem>
    );
  };

  return (
    <>
      <div className="container mx-auto mt-5 mb-5">
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-2">
            <CardHeader>
              <CardTitle>Bitshares Liquidity Pool Exchange</CardTitle>
              <CardDescription>
                Easily swap between Bitshares assets using one of these user
                created liquidity pools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pools ? <p>Loading pool data</p> : null}
              {!assets ? <p>Loading asset data</p> : null}
              {pools && assets ? (
                <>
                  <Form {...form}>
                    <form
                      onSubmit={() => {
                        setData(true);
                        setShowDialog(true);
                        event.preventDefault();
                      }}
                    >
                      <FormField
                        control={form.control}
                        name="account"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account</FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                placeholder="Bitshares account (1.2.x)"
                                className="mb-3 mt-3"
                                value={`${usr.username} (${usr.id})`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <div className="grid grid-cols-2 mt-3">
                                <div className="mt-1">Liquidity pool</div>
                                <div className="text-gray-500 text-right">
                                  <Dialog
                                    open={dialogOpen}
                                    onOpenChange={(open) => {
                                      if (!open) {
                                        setThisResult();
                                      }

                                      setDialogOpen(open);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button className="h-5 p-3">
                                        Search
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[900px] bg-white">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Search for a liquidity pool
                                        </DialogTitle>
                                        <DialogDescription>
                                          Select a search result to proceed with
                                          your desired asset swap.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid grid-cols-1">
                                        <div className="col-span-1">
                                          <Tabs defaultValue="asset">
                                            <TabsList className="grid max-w-[400px] grid-cols-2 mb-1 gap-3">
                                              {activeTab === "asset" ? (
                                                <TabsTrigger
                                                  style={activeTabStyle}
                                                  value="asset"
                                                >
                                                  Swappable assets
                                                </TabsTrigger>
                                              ) : (
                                                <TabsTrigger
                                                  value="asset"
                                                  onClick={() =>
                                                    setActiveTab("asset")
                                                  }
                                                >
                                                  Swappable assets
                                                </TabsTrigger>
                                              )}
                                              {activeTab === "share" ? (
                                                <TabsTrigger
                                                  style={activeTabStyle}
                                                  value="share"
                                                >
                                                  Pool share asset
                                                </TabsTrigger>
                                              ) : (
                                                <TabsTrigger
                                                  value="share"
                                                  onClick={() =>
                                                    setActiveTab("share")
                                                  }
                                                >
                                                  Pool share asset
                                                </TabsTrigger>
                                              )}
                                            </TabsList>

                                            <Input
                                              name="assetSearch"
                                              placeholder="Enter search text"
                                              className="mb-3 max-w-[400px]"
                                              onChange={(event) => {
                                                setThisInput(
                                                  event.target.value
                                                );
                                              }}
                                            />

                                            <TabsContent value="share">
                                              {thisResult &&
                                              thisResult.length ? (
                                                <>
                                                  <div className="grid grid-cols-12">
                                                    <div className="col-span-2">
                                                      ID
                                                    </div>
                                                    <div className="col-span-3">
                                                      <b>Share asset</b>
                                                    </div>
                                                    <div className="col-span-3">
                                                      Asset A
                                                    </div>
                                                    <div className="col-span-3">
                                                      Asset B
                                                    </div>
                                                    <div className="col-span-1">
                                                      Taker Fee
                                                    </div>
                                                  </div>
                                                  <List
                                                    height={400}
                                                    itemCount={
                                                      thisResult.length
                                                    }
                                                    itemSize={45}
                                                    className="w-full"
                                                  >
                                                    {PoolRow}
                                                  </List>
                                                </>
                                              ) : null}
                                            </TabsContent>

                                            <TabsContent value="asset">
                                              {thisResult &&
                                              thisResult.length ? (
                                                <>
                                                  <div className="grid grid-cols-12">
                                                    <div className="col-span-2">
                                                      ID
                                                    </div>
                                                    <div className="col-span-3">
                                                      Share asset
                                                    </div>
                                                    <div className="col-span-3">
                                                      <b>Asset A</b>
                                                    </div>
                                                    <div className="col-span-3">
                                                      <b>Asset B</b>
                                                    </div>
                                                    <div className="col-span-1">
                                                      Taker Fee
                                                    </div>
                                                  </div>
                                                  <List
                                                    height={400}
                                                    itemCount={
                                                      thisResult.length
                                                    }
                                                    itemSize={45}
                                                    className="w-full"
                                                  >
                                                    {PoolRow}
                                                  </List>
                                                </>
                                              ) : null}
                                            </TabsContent>
                                          </Tabs>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </FormLabel>
                            <FormControl
                              onValueChange={(chosenPool) => {
                                setPool(chosenPool);
                              }}
                            >
                              <Select key={poolKey}>
                                <SelectTrigger className="mb-3">
                                  <SelectValue
                                    placeholder={
                                      foundPool
                                        ? `${foundPool.id} - ${foundPool.share_asset_symbol} - ${foundPool.asset_a_symbol}:${foundPool.asset_b_symbol}`
                                        : "Select a pool.."
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  {pools && pools.length ? (
                                    <List
                                      height={150}
                                      itemCount={pools.length}
                                      itemSize={35}
                                      className="w-full"
                                      initialScrollOffset={
                                        pools.map((x) => x.id).indexOf(pool) *
                                        35
                                      }
                                    >
                                      {Row}
                                    </List>
                                  ) : null}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-5 mt-5 mb-5">
                        {pool ? (
                          <>
                            <Card>
                              <CardContent>
                                <FormField
                                  control={form.control}
                                  name="balanceA"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Swappable {assetA.symbol} ({assetA.id})
                                      </FormLabel>
                                      <FormControl>
                                        {foundPoolDetails ? (
                                          <Input
                                            disabled
                                            placeholder="0"
                                            className="mb-3 mt-3"
                                            value={
                                              foundPoolDetails.readable_balance_a
                                            }
                                          />
                                        ) : (
                                          <Skeleton className="h-4 w-[250px]" />
                                        )}
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent>
                                <FormField
                                  control={form.control}
                                  name="balanceB"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Swappable {assetB.symbol} ({assetB.id})
                                      </FormLabel>
                                      <FormControl>
                                        {foundPoolDetails ? (
                                          <Input
                                            disabled
                                            placeholder="0"
                                            className="mb-3 mt-3"
                                            value={
                                              foundPoolDetails.readable_balance_b
                                            }
                                          />
                                        ) : (
                                          <Skeleton className="h-4 w-[250px]" />
                                        )}
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </CardContent>
                            </Card>
                          </>
                        ) : null}
                      </div>

                      {pool && pool.length ? (
                        <>
                          <FormField
                            control={form.control}
                            name="sellAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{`Amount of ${
                                  assetA ? assetA.symbol : "???"
                                } to swap`}</FormLabel>
                                <FormControl
                                  onChange={(event) => {
                                    const input = event.target.value;
                                    const regex = /^[0-9]*\.?[0-9]*$/; // regular expression to match numbers and a single period
                                    if (regex.test(input)) {
                                      setSellAmount(input);
                                    }
                                  }}
                                >
                                  <Input
                                    label={`Amount of ${
                                      assetA ? assetA.symbol : "???"
                                    } to swap`}
                                    value={sellAmount}
                                    placeholder={sellAmount}
                                    className="mb-3"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : null}

                      {sellAmount &&
                      foundPoolDetails &&
                      foundPoolDetails.taker_fee_percent ? (
                        <>
                          <FormField
                            control={form.control}
                            name="marketFee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pool fee</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled
                                    placeholder="0"
                                    className="mb-3 mt-3"
                                    value={`${(
                                      (foundPoolDetails.taker_fee_percent /
                                        10000) *
                                      sellAmount
                                    ).toFixed(assetA.precision)} (${
                                      assetA.symbol
                                    }) (${
                                      foundPoolDetails.taker_fee_percent / 100
                                    }% fee)`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : null}

                      {foundPool ? (
                        <FormField
                          control={form.control}
                          name="networkFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Network fee</FormLabel>
                              <FormControl>
                                <Input
                                  disabled
                                  placeholder={`${fee} BTS`}
                                  className="mb-3 mt-3"
                                />
                              </FormControl>
                              {usr.id === usr.referrer ? (
                                <FormMessage>
                                  Rebate: {fee * 0.8} BTS (vesting)
                                </FormMessage>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : null}

                      {foundPoolDetails ? (
                        <>
                          <FormField
                            control={form.control}
                            name="buyAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{`Amount of ${
                                  assetB ? assetB.symbol : "???"
                                } you'll receive`}</FormLabel>
                                <FormControl>{buyAmountInput}</FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : null}

                      {!pool ||
                      !sellAmount ||
                      !buyAmount ||
                      deepLinkInProgress !== false ? (
                        <Button
                          className="mt-5 mb-3"
                          variant="outline"
                          disabled
                          type="submit"
                        >
                          Submit
                        </Button>
                      ) : (
                        <Button
                          className="mt-5 mb-3"
                          variant="outline"
                          type="submit"
                        >
                          Submit
                        </Button>
                      )}
                    </form>
                  </Form>
                  {showDialog && data && deeplink && (
                    <Dialog
                      open={showDialog}
                      onOpenChange={(open) => {
                        if (!open) {
                          // Clearing generated deeplink
                          setData("");
                          setDeeplink("");
                          setTRXJSON();
                          // Clearing form data
                          setPool("");
                          setSellAmount(0);
                          setBuyAmount(0);
                          setFoundPool();
                          setAssetA("");
                          setAssetB("");
                          // Clearing keys
                          setPoolKey(`pool_key${Date.now()}`);
                        }
                        setShowDialog(open);
                      }}
                    >
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <>
                          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight">
                            Exchanging {sellAmount} {assetA.symbol} for{" "}
                            {buyAmount} {assetB.symbol}
                          </h1>
                          <h3 className="scroll-m-20 text-1xl font-semibold tracking-tight mb-3 mt-1">
                            Your requested Bitshares pool exchange operation is
                            ready!
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            <Button
                              color="gray"
                              className="w-full"
                              onClick={() => {
                                copyToClipboard(JSON.stringify(trxJSON));
                              }}
                              variant="outline"
                            >
                              Copy operation JSON
                            </Button>

                            {downloadClicked ? (
                              <Button variant="outline" disabled>
                                Downloading...
                              </Button>
                            ) : (
                              <a
                                href={`data:text/json;charset=utf-8,${deeplink}`}
                                download={`pool_exchange.json`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleDownloadClick}
                              >
                                <Button variant="outline" className="w-full">
                                  Download Beet operation JSON
                                </Button>
                              </a>
                            )}

                            <a
                              href={`rawbeet://api?chain=BTS&request=${deeplink}`}
                            >
                              <Button variant="outline" className="w-full">
                                Trigger raw Beet deeplink
                              </Button>
                            </a>
                          </div>
                        </>
                      </DialogContent>
                    </Dialog>
                  )}
                  {pool && !deepLinkInProgress ? (
                    <Button
                      variant="outline"
                      mt="xl"
                      onClick={() => {
                        const oldAssetA = assetA;
                        const oldAssetB = assetB;
                        setAssetA(oldAssetB);
                        setAssetB(oldAssetA);
                      }}
                    >
                      Swap buy/sell
                    </Button>
                  ) : null}
                  {pool && deepLinkInProgress ? (
                    <Button variant="outline" mt="xl" disabled>
                      Swap buy/sell
                    </Button>
                  ) : null}
                  {pool ? (
                    <a
                      href={`https://blocksights.info/#/pools/${pool}${
                        usr.chain !== "bitshares" ? "?network=testnet" : ""
                      }`}
                      target="_blank"
                    >
                      <Button variant="outline" className="ml-2">
                        Blocksights pool explorer
                      </Button>
                    </a>
                  ) : null}
                  {foundPoolDetails ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="ml-2" variant="outline">
                          Pool JSON
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[550px] bg-white">
                        <DialogHeader>
                          <DialogTitle>Liquidity Pool JSON</DialogTitle>
                          <DialogDescription>
                            Check out the details returned by the network for
                            this pool
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1">
                          <div className="col-span-1">
                            <ScrollArea className="h-72 rounded-md border">
                              <pre>
                                {JSON.stringify(foundPoolDetails, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {assetA && assetB ? (
          <PoolDialogs
            assetA={assetA.symbol}
            assetAData={assetA}
            assetB={assetB.symbol}
            assetBData={assetB}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-5 mt-5">
          {pool ? (
            <div className="grid grid-cols-1 gap-3">
              {usrBalances && foundPoolDetails ? (
                <>
                  <MarketAssetCard
                    asset={assetB.symbol}
                    assetData={assetB}
                    assetDetails={assetBDetails}
                    bitassetData={bBitassetData}
                    marketSearch={marketSearch}
                    chain={usr.chain}
                    usrBalances={usrBalances}
                    type="buy"
                  />
                  <MarketAssetCard
                    asset={assetA.symbol}
                    assetData={assetA}
                    assetDetails={assetADetails}
                    bitassetData={aBitassetData}
                    marketSearch={marketSearch}
                    chain={usr.chain}
                    usrBalances={usrBalances}
                    type="sell"
                  />
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Quote asset</CardTitle>
                      <CardDescription className="text-lg">
                        Loading...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Base asset</CardTitle>
                      <CardDescription className="text-lg">
                        Loading...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3">
            {pool && assetA && assetB ? (
              <>
                <a
                  href={`/dex/index.html?market=${assetA.symbol}_${assetB.symbol}`}
                >
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Trade on the Dex instead?</CardTitle>
                      <CardDescription className="text-sm">
                        Market: {assetA.symbol}/{assetB.symbol}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm pb-2">
                      You can manually create limit orders for trading pairs of
                      your choice on the Bitshares DEX
                    </CardContent>
                  </Card>
                </a>
                <a
                  href={`/dex/index.html?market=${
                    foundPool?.share_asset_symbol
                  }_${assetA.symbol !== "BTS" ? "BTS" : assetA.symbol}`}
                >
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Purchase stake in this pool?</CardTitle>
                      <CardDescription className="text-sm">
                        Share asset: {foundPool?.share_asset_symbol}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm pb-2">
                      Receive swap fee yield over time by owning a stake in the
                      pool via a market limit order.
                    </CardContent>
                  </Card>
                </a>
                <a href={`/stake/index.html?pool=${pool}`}>
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Stake assets in this pool?</CardTitle>
                      <CardDescription className="text-sm">
                        Share asset: {foundPool?.share_asset_symbol}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm pb-2">
                      Earn swap fees on assets staked in liquidity pools minus a
                      small pool defined withdrawal fee.
                    </CardContent>
                  </Card>
                </a>
                <a href="/borrow/index.html">
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Need to borrow some assets?</CardTitle>
                      <CardDescription className="text-sm">
                        Borrow {assetA.symbol} or {assetB.symbol}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm pb-2">
                      DEX users lend assets at user defined rates. Borrow from
                      DEX participants, with user defined rates.
                    </CardContent>
                  </Card>
                </a>

                {foundPoolDetails && marketSearch && usrBalances ? (
                  <MarketAssetCard
                    asset={foundPoolDetails.share_asset_symbol}
                    assetData={foundPoolDetails.share_asset_details}
                    assetDetails={poolShareDetails}
                    bitassetData={null}
                    marketSearch={marketSearch}
                    chain={usr.chain}
                    usrBalances={usrBalances}
                    type="pool"
                  />
                ) : (
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle>Pool share asset</CardTitle>
                      <CardDescription className="text-lg">
                        Loading...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {usr && usr.username && usr.username.length ? (
        <CurrentUser
          usr={usr}
          resetCallback={() => {
            eraseCurrentUser();
            setData("");
            setPool("");
            setFoundPool();
            setFoundPoolDetails();
            window.history.replaceState({}, "", "/pool/index.html");
            resetCache();
            setSellAmount(0);
            setBuyAmount(0);
            setFoundPool();
            setAssetA("");
            setAssetB("");
            setDeeplink("");
            setTRXJSON();
            setDeepLinkInProgress(false);
            setBuyAmountInput();
          }}
        />
      ) : null}
    </>
  );
}
