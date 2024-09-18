"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreHorizontal, AlertCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchGammaCustomers,
  updateGammaHaloCustomerSync,
  updateGammaHaloItem,
  fetchGammaHaloItems,
} from "../../slices/gamma/gammaSlice";
import {
  fetchHaloClients,
  fetchHaloItems,
  fetchHaloContracts,
  createHaloRecurringInvoice,
  fetchGammaHaloItem,
} from "../../slices/halo/haloSlice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BeatLoader } from "react-spinners";
import { ComboboxDemo } from "@/components/ui/combobox";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Lock, Hash } from "lucide-react";

export function SyncDashboard() {
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [subscriptionSearch, setSubscriptionSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCustomer, setSyncedCustomer] = useState<string | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<any | null>(null);

  const dispatch = useAppDispatch();

  const {
    customers: gammaCustomers,
    status: gammaStatus,
    subscriptions: gammaSubscriptions,
  } = useAppSelector((state) => state.gamma);

  const {
    clients: haloClients,
    items: haloItems,
    currentItem,
    status: haloStatus,
  } = useAppSelector((state) => state.halo);

  useEffect(() => {
    if (gammaStatus === "idle") {
      dispatch(fetchGammaCustomers());
      dispatch(fetchGammaHaloItems());
    }
  }, [gammaStatus]);

  useEffect(() => {
    if (haloStatus === "idle") {
      dispatch(fetchHaloClients({}));
      dispatch(fetchHaloItems());
    }
  }, [haloStatus]);

  const filteredCustomers = gammaCustomers.filter(
    (customer) =>
      customer.gamma_name
        .toLowerCase()
        .includes(customerSearch.toLowerCase()) ||
      customer.customer_gamma_id.includes(customerSearch)
  );

  const totalFilteredCustomers = filteredCustomers.length;
  const totalPages = Math.ceil(totalFilteredCustomers / itemsPerPage);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [selectedHaloCustomers, setSelectedHaloCustomers] = useState<
    Record<string, { id: string; name: string }>
  >({});

  const handleHaloCustomerSelect = (
    gammaCustomerId: string,
    haloCustomerId: string,
    haloCustomerName: string
  ) => {
    setSelectedHaloCustomers((prev) => ({
      ...prev,
      [gammaCustomerId]: { id: haloCustomerId, name: haloCustomerName },
    }));
  };

  const handleSyncChanges = async (customerId: number) => {
    console.log(`Starting sync for customer ID: ${customerId}`);
    console.log("Selected Halo customer:", selectedHaloCustomers);
    const selectedHalo = selectedHaloCustomers[customerId];
    console.log("Selected Halo customer:", selectedHalo);
    if (selectedHalo && !isSyncing) {
      setIsSyncing(true);
      console.log("Syncing started");
      try {
        console.log("Dispatching updateGammaHaloCustomerSync");
        const result = await dispatch(
          updateGammaHaloCustomerSync({
            customerId,
            haloId: parseInt(selectedHalo.id),
            haloName: selectedHalo.name,
          })
        ).unwrap();
        console.log("updateGammaHaloCustomerSync result:", result);
        setSyncedCustomer(selectedHalo.name);

        console.log("Fetching updated Halo state");
        await dispatch(fetchHaloClients({}));
        await dispatch(fetchHaloItems());
        console.log("Halo state updated");

        toast.success(`Successfully synced with ${selectedHalo.name}`);
      } catch (error) {
        console.error("Sync failed:", error);
        toast.error("Sync failed. Please try again.");
      } finally {
        setIsSyncing(false);
        console.log("Syncing finished");
      }
    } else {
      console.log(
        "Sync not started: No selected Halo customer or already syncing"
      );
    }
  };

  const [selectedHaloItems, setSelectedHaloItems] = useState<
    Record<string, { id: string; name: string }>
  >({});

  const handleHaloItemSelect = (
    subscriptionId: string,
    haloItemId: string,
    haloItemName: string
  ) => {
    setSelectedHaloItems((prev) => ({
      ...prev,
      [subscriptionId]: { id: haloItemId, name: haloItemName },
    }));
  };

  const [syncingSubscriptions, setSyncingSubscriptions] = useState<
    Record<string, boolean>
  >({});

  const handleSyncSubscription = async (
    subscriptionId: string,
    subscriptionName: string
  ) => {
    const selectedHaloItem = selectedHaloItems[subscriptionId];
    if (selectedHaloItem && !syncingSubscriptions[subscriptionId]) {
      setSyncingSubscriptions((prev) => ({ ...prev, [subscriptionId]: true }));
      try {
        await dispatch(
          updateGammaHaloItem({
            id: parseInt(subscriptionId),
            item_halo_id: selectedHaloItem.id.toString(),
            item_halo_name: selectedHaloItem.name,
            item_synced: true,
          })
        ).unwrap();

        // Fetch updated Halo state
        await dispatch(fetchHaloClients({}));
        await dispatch(fetchHaloItems());

        toast.success(
          `Successfully synced ${subscriptionName} with Halo item ${selectedHaloItem.name}`
        );
      } catch (error) {
        toast.error("Sync failed. Please try again.");
      } finally {
        setSyncingSubscriptions((prev) => ({
          ...prev,
          [subscriptionId]: false,
        }));
      }
    } else {
      toast.error("Please select a Halo item before syncing.");
    }
  };

  const handleUnsyncSubscription = async (
    subscriptionId: string,
    subscriptionName: string
  ) => {
    if (!syncingSubscriptions[subscriptionId]) {
      setSyncingSubscriptions((prev) => ({ ...prev, [subscriptionId]: true }));
      try {
        await dispatch(
          updateGammaHaloItem({
            id: parseInt(subscriptionId),
            item_synced: false,
          })
        ).unwrap();
        console.log("Unsynced subscription", subscriptionId, subscriptionName);

        // Fetch updated Halo state
        await dispatch(fetchHaloClients({}));
        await dispatch(fetchHaloItems());

        toast.success(`Successfully unsynced ${subscriptionName}`);
      } catch (error) {
        toast.error("Unsync failed. Please try again.");
      } finally {
        setSyncingSubscriptions((prev) => ({
          ...prev,
          [subscriptionId]: false,
        }));
      }
    }
  };

  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const [agreements, setAgreements] = useState<any[]>([]);
  const [agreementSearch, setAgreementSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const searchAgreements = async () => {
      if (agreementSearch.length > 2) {
        try {
          const response = await dispatch(
            fetchHaloContracts(agreementSearch)
          ).unwrap();
          setAgreements(response);
        } catch (error) {
          console.error("Error fetching agreements:", error);
          toast.error("Failed to fetch agreements. Please try again.");
        }
      } else {
        setAgreements([]);
      }
    };

    const debounce = setTimeout(searchAgreements, 300);
    return () => clearTimeout(debounce);
  }, [agreementSearch, dispatch]);

  useEffect(() => {
    const fetchSelectedItem = async () => {
      if (selectedId) {
        try {
          console.log("Fetching item", selectedId);
          await dispatch(fetchGammaHaloItem(parseInt(selectedId))).unwrap();
          console.log("Current item", currentItem);
        } catch (error) {
          console.error("Error fetching selected item:", error);
          toast.error("Failed to fetch item details. Please try again.");
        }
      }
    };

    fetchSelectedItem();
  }, [selectedId, dispatch]);

  const handleAgreementSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreementSearch(e.target.value);
  };

  const handleAddRecurringInvoice = (
    subscriptionId: string,
    subscriptionName: string
  ) => {
    console.log(
      "Adding recurring invoice for",
      subscriptionId,
      subscriptionName
    );
    setAgreementSearch(subscriptionName);
    setSelectedId(subscriptionId);
    setIsInvoiceDialogOpen(true);
  };

  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const handleCreateRecurringInvoice = async () => {
    if (!isCreatingInvoice) {
      setIsCreatingInvoice(true);
      try {
        await dispatch(
          createHaloRecurringInvoice({
            clientId: selectedAgreement?.client_id,
            contractId: selectedAgreement?.id,
            items: [currentItem],
          })
        ).unwrap();
        toast.success("Recurring invoice created successfully");
        setIsInvoiceDialogOpen(false);
      } catch (error) {
        console.error("Error creating recurring invoice:", error);
        toast.error("Failed to create recurring invoice. Please try again.");
      } finally {
        setIsCreatingInvoice(false);
      }
    }
  };

  const [haloCustomerOptions, setHaloCustomerOptions] = useState(
    haloClients.map((client) => ({ value: client.id, label: client.name }))
  );

  const [haloItemOptions, setHaloItemOptions] = useState(
    haloItems.map((item) => ({ value: item.id, label: item.name }))
  );

  useEffect(() => {
    setHaloCustomerOptions(
      haloClients.map((client) => ({ value: client.id, label: client.name }))
    );
  }, [haloClients]);

  useEffect(() => {
    setHaloItemOptions(
      haloItems.map((item) => ({ value: item.id, label: item.name }))
    );
  }, [haloItems]);

  const safeGammaSubscriptions = Array.isArray(gammaSubscriptions)
    ? gammaSubscriptions
    : [];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1200px] w-full mx-auto">
          <div className="w-full min-w-[1000px] mx-auto">
            <Tabs defaultValue="customers">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              </TabsList>

              <div className="w-full max-w-[900px] mx-auto">
                <TabsContent value="customers" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search customers"
                        className="max-w-2xl"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setCurrentPage(1); // Reset to first page on new search
                        }}
                      />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gamma Customer</TableHead>
                        <TableHead>HaloPSA Customer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer) => (
                        <TableRow key={customer.customer_gamma_id}>
                          <TableCell className="font-medium">
                            {customer.gamma_name}
                            <div className="text-sm text-muted-foreground">
                              {customer.customer_gamma_id}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.synced ? (
                              <div>
                                {customer.halo_name}
                                <div className="text-sm text-muted-foreground">
                                  {customer.customer_halo_id}
                                </div>
                              </div>
                            ) : (
                              <ComboboxDemo
                                options={haloCustomerOptions}
                                onSelect={(value) => {
                                  console.log("Selected value:", value);
                                  const selectedHalo = haloClients.find(
                                    (hc) => hc.name === value
                                  );
                                  console.log("Halo Clients:", haloClients);
                                  console.log(
                                    "Selected Halo customer:",
                                    selectedHalo
                                  );
                                  if (selectedHalo) {
                                    console.log(
                                      "Handling Halo customer select"
                                    );
                                    handleHaloCustomerSelect(
                                      customer.id.toString(),
                                      selectedHalo.id,
                                      selectedHalo.name
                                    );
                                  }
                                }}
                                placeholder="Halo Customer"
                                selectedValue={
                                  selectedHaloCustomers[customer.id]?.id
                                }
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40">
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      console.log(
                                        "Customer IDs:",
                                        paginatedCustomers
                                      );
                                      handleSyncChanges(customer.id);
                                    }}
                                    disabled={
                                      !selectedHaloCustomers[
                                        customer.customer_gamma_id
                                      ] || isSyncing
                                    }
                                  >
                                    {isSyncing ? (
                                      <BeatLoader color="#0C797D" size={8} />
                                    ) : (
                                      "Sync Changes"
                                    )}
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationComponent
                    currentPage={currentPage}
                    totalItems={totalFilteredCustomers}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </TabsContent>

                <TabsContent value="subscriptions" className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search companies"
                        className="max-w-2xl"
                        value={subscriptionSearch}
                        onChange={(e) => setSubscriptionSearch(e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company & Subscriptions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gammaStatus === "loading" ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <p className="mt-4 text-sm text-muted-foreground">
                              Loading customers and subscriptions...
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : paginatedCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                              No customers found
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCustomers.map((customer) => (
                          <React.Fragment key={customer.customer_gamma_id}>
                            <TableRow>
                              <TableCell
                                className="font-medium bg-muted"
                                colSpan={4}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <div>
                                    <span className="text-lg">
                                      {customer.gamma_name}
                                    </span>
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      ({customer.customer_gamma_id})
                                    </span>
                                  </div>
                                  <Badge variant="outline">
                                    {safeGammaSubscriptions?.filter(
                                      (sub) =>
                                        sub.customer_gamma_id ===
                                        customer.customer_gamma_id
                                    ).length || 0}{" "}
                                    Subscriptions
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2}>
                                {!customer.synced && (
                                  <Alert variant="destructive" className="mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Not Synced</AlertTitle>
                                    <AlertDescription>
                                      This customer has not been synced with
                                      Halo PSA.
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </TableCell>
                            </TableRow>

                            {safeGammaSubscriptions?.filter(
                              (sub) =>
                                sub.customer_gamma_id ===
                                customer.customer_gamma_id
                            ).length > 0 ? (
                              safeGammaSubscriptions
                                ?.filter(
                                  (sub) =>
                                    sub.customer_gamma_id ===
                                    customer.customer_gamma_id
                                )
                                .map((subscription) => (
                                  <TableRow
                                    key={`${customer.customer_gamma_id}-${subscription.id}`}
                                    className="hover:bg-muted/50 transition-colors"
                                  >
                                    <TableCell>
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="font-medium">
                                            {subscription.item_gamma_name}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            ID: {subscription.item_gamma_id}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            Count: {subscription.count}
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                          {subscription.item_synced ? (
                                            <div>
                                              <div className="font-medium">
                                                {subscription.item_halo_name}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                ID: {subscription.item_halo_id}
                                              </div>
                                            </div>
                                          ) : (
                                            <ComboboxDemo
                                              options={haloItemOptions}
                                              onSelect={(value) => {
                                                console.log(
                                                  "Selected value:",
                                                  value
                                                );
                                                const selectedItem =
                                                  haloItems.find(
                                                    (item) =>
                                                      item.name === value
                                                  );
                                                console.log(
                                                  "Selected item:",
                                                  selectedItem
                                                );
                                                console.log(
                                                  "Halo Items:",
                                                  haloItems
                                                );
                                                if (selectedItem) {
                                                  console.log(
                                                    "Handling Halo item select"
                                                  );
                                                  handleHaloItemSelect(
                                                    subscription.id,
                                                    selectedItem.id,
                                                    selectedItem.name
                                                  );
                                                }
                                              }}
                                              placeholder="Halo Subscription"
                                              selectedValue={
                                                selectedHaloItems[
                                                  subscription.id
                                                ]?.id
                                              }
                                            />
                                          )}
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="icon"
                                              >
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56">
                                              <div className="flex flex-col space-y-1">
                                                <Button
                                                  variant="ghost"
                                                  className="justify-start"
                                                  onClick={() =>
                                                    handleSyncSubscription(
                                                      subscription.id,
                                                      subscription.item_gamma_name
                                                    )
                                                  }
                                                  disabled={
                                                    subscription.item_synced ||
                                                    !selectedHaloItems[
                                                      subscription.id
                                                    ] ||
                                                    syncingSubscriptions[
                                                      subscription.id
                                                    ]
                                                  }
                                                >
                                                  {syncingSubscriptions[
                                                    subscription.id
                                                  ] ? (
                                                    <BeatLoader
                                                      color="#0C797D"
                                                      size={8}
                                                    />
                                                  ) : (
                                                    "Sync Subscription"
                                                  )}
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  className="justify-start"
                                                  onClick={() => {
                                                    handleUnsyncSubscription(
                                                      subscription.id,
                                                      subscription.item_gamma_name
                                                    );
                                                  }}
                                                  disabled={
                                                    syncingSubscriptions[
                                                      subscription.id
                                                    ]
                                                  }
                                                >
                                                  {syncingSubscriptions[
                                                    subscription.id
                                                  ] ? (
                                                    <BeatLoader
                                                      color="#0C797D"
                                                      size={8}
                                                    />
                                                  ) : (
                                                    "Unsync Subscription"
                                                  )}
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  className="justify-start"
                                                  onClick={() =>
                                                    handleAddRecurringInvoice(
                                                      subscription.id,
                                                      customer.halo_name ?? ""
                                                    )
                                                  }
                                                  disabled={isCreatingInvoice}
                                                >
                                                  {isCreatingInvoice ? (
                                                    <BeatLoader
                                                      color="#ffffff"
                                                      size={8}
                                                    />
                                                  ) : (
                                                    "Add Recurring Invoice"
                                                  )}
                                                </Button>
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`disabled-${subscription.id}`}
                                            checked={subscription.disabled}
                                            onCheckedChange={(checked) =>
                                              console.log("Disabled:", checked)
                                            }
                                          />
                                          <label
                                            htmlFor={`disabled-${subscription.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            <Lock className="h-4 w-4 inline-block mr-2" />
                                            Disabled
                                          </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`override-${subscription.id}`}
                                            checked={subscription.override}
                                            onCheckedChange={(checked) =>
                                              console.log("Override:", checked)
                                            }
                                          />
                                          <label
                                            htmlFor={`override-${subscription.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            <Pencil className="h-4 w-4 inline-block mr-2" />
                                            Override
                                          </label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Hash className="h-4 w-4" />
                                          <Input
                                            type="number"
                                            className="w-16 h-8"
                                            defaultValue={
                                              subscription.override_count
                                            }
                                            min="0"
                                            onChange={(e) => {
                                              const value = Math.max(
                                                0,
                                                parseInt(e.target.value)
                                              );
                                              console.log(
                                                "Override count:",
                                                value
                                              );
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-4"
                                >
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    No subscriptions found for this customer.
                                  </p>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationComponent
                    currentPage={currentPage}
                    totalItems={totalFilteredCustomers}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Recurring Invoice</DialogTitle>
            <DialogDescription>
              Search for an agreement and select it to create a recurring
              invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search agreements..."
              className="flex-grow"
              value={agreementSearch}
              onChange={handleAgreementSearch}
            />
            <Button variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement, index) => (
                <TableRow
                  key={agreement.id}
                  className={agreement === selectedAgreement ? "bg-muted" : ""}
                >
                  <TableCell>{agreement.ref}</TableCell>
                  <TableCell>{agreement.client_name}</TableCell>
                  <TableCell>
                    <Button
                      variant={
                        agreement === selectedAgreement ? "default" : "outline"
                      }
                      onClick={() => setSelectedAgreement(agreement)}
                    >
                      {agreement === selectedAgreement ? "Selected" : "Select"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInvoiceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRecurringInvoice}
              disabled={!selectedAgreement || isCreatingInvoice}
            >
              {isCreatingInvoice ? (
                <BeatLoader color="#ffffff" size={8} />
              ) : (
                "Create Recurring Invoice"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}

interface PaginationComponentProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function PaginationComponent({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationComponentProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationItems = [];

  // Add first three pages
  for (let i = 0; i < Math.min(3, totalPages); i++) {
    paginationItems.push(i + 1);
  }

  // Add ellipsis if needed
  if (totalPages > 5 && currentPage > 4) {
    paginationItems.push("...");
  }

  // Add current page and surrounding pages
  if (currentPage > 3 && currentPage < totalPages - 2) {
    paginationItems.push(currentPage);
  }

  // Add last two pages
  for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
    if (!paginationItems.includes(i)) {
      paginationItems.push(i);
    }
  }

  return (
    <Pagination>
      <PaginationContent style={{ justifyContent: "center" }}>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          />
        </PaginationItem>
        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {item === "..." ? (
              <span>...</span>
            ) : (
              <PaginationLink
                isActive={currentPage === item}
                onClick={() =>
                  onPageChange(typeof item === "number" ? item : currentPage)
                }
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}