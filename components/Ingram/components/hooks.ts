"use client";

import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchIngramClients,
  fetchIngramHaloItems,
  updateIngramHaloCustomerSync,
} from "@/slices/ingram/ingramSlice";
import {
  fetchHaloClients,
  fetchHaloItemsForIngram,
  updateIngramHaloItem,
  fetchHaloContracts,
  createHaloRecurringInvoice,
  fetchIngramHaloItem,
} from "@/slices/halo/haloSlice";
import { toast } from "react-toastify";

export const useIngramSync = () => {
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [subscriptionSearch, setSubscriptionSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const [isSyncing, setIsSyncing] = useState(false);

  const [syncedCustomer, setSyncedCustomer] = useState<string | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<any | null>(null);
  const [overrideCounts, setOverrideCounts] = useState<Record<string, number>>(
    {}
  );

  const dispatch = useAppDispatch();

  const {
    clients: ingramClients,
    subscriptions: ingramSubscriptions,
    status: ingramStatus,
  } = useAppSelector((state) => state.ingram);
  const {
    clients: haloClients,
    items: haloItems,
    currentItem,
    status: haloStatus,
  } = useAppSelector((state) => state.halo);

  useEffect(() => {
    if (ingramStatus === "idle") {
      dispatch(fetchIngramClients()).unwrap();
      dispatch(fetchIngramHaloItems()).unwrap();
    }
  }, [ingramStatus]);

  useEffect(() => {
    if (haloStatus === "idle") {
      dispatch(fetchHaloClients()).unwrap();
      dispatch(fetchHaloItemsForIngram()).unwrap();
    }
  }, [haloStatus]);

  const filteredCustomers = ingramClients
    .filter(
      (customer) =>
        (customer.ingram_name?.toLowerCase() ?? "").includes(
          customerSearch.toLowerCase()
        ) || (customer.customer_ingram_id ?? "").includes(customerSearch)
    )
    .sort((a, b) => (a.ingram_name ?? "").localeCompare(b.ingram_name ?? ""));

  const filteredSubscriptions = ingramSubscriptions
    .filter(
      (subscription) =>
        (subscription.item_ingram_name?.toLowerCase() ?? "").includes(
          subscriptionSearch.toLowerCase()
        ) || (subscription.item_ingram_id ?? "").includes(subscriptionSearch)
    )
    .sort((a, b) =>
      (a.item_ingram_name ?? "").localeCompare(b.item_ingram_name ?? "")
    );

  const totalFilteredCustomers = filteredCustomers.length;

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [selectedHaloCustomers, setSelectedHaloCustomers] = useState<
    Record<string, { id: string; name: string }>
  >({});

  const handleHaloCustomerSelect = (
    ingramCustomerId: string,
    haloCustomerId: string,
    haloCustomerName: string
  ) => {
    setSelectedHaloCustomers((prev) => ({
      ...prev,
      [ingramCustomerId]: { id: haloCustomerId, name: haloCustomerName },
    }));
  };

  const handleSyncChanges = async (customerId: number) => {
    const selectedHalo = selectedHaloCustomers[customerId];
    if (selectedHalo && !isSyncing) {
      setIsSyncing(true);
      try {
        await dispatch(
          updateIngramHaloCustomerSync({
            customerId,
            haloId: selectedHalo.id,
            haloName: selectedHalo.name,
            synced: true,
          })
        ).unwrap();
        setSyncedCustomer(selectedHalo.name);

        // Fetch updated Halo state
        await dispatch(fetchHaloClients()).unwrap();
        await dispatch(fetchHaloItemsForIngram()).unwrap();

        toast.success(`Successfully synced with ${selectedHalo.name}`);
      } catch (error) {
        toast.error("Sync failed. Please try again.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUnsyncChanges = async (customerId: number) => {
    if (!isSyncing) {
      setIsSyncing(true);
      try {
        await dispatch(
          updateIngramHaloCustomerSync({
            customerId,
            haloId: "",
            haloName: "",
            synced: false,
          })
        ).unwrap();
        setSyncedCustomer(null);

        // Fetch updated Halo state
        await dispatch(fetchHaloClients()).unwrap();
        await dispatch(fetchHaloItemsForIngram()).unwrap();

        toast.success("Successfully unsynced customer");
      } catch (error) {
        toast.error("Unsync failed. Please try again.");
      } finally {
        setIsSyncing(false);
      }
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
      setSyncingSubscriptions((prev) => ({
        ...prev,
        [subscriptionId]: true,
      }));
      try {
        await dispatch(
          updateIngramHaloItem({
            id: parseInt(subscriptionId),
            item_halo_id: selectedHaloItem.id.toString(),
            item_halo_name: selectedHaloItem.name,
            item_synced: true,
          })
        ).unwrap();

        // Fetch updated Halo state
        await dispatch(fetchHaloClients()).unwrap();
        await dispatch(fetchHaloItemsForIngram()).unwrap();
        await dispatch(fetchIngramClients()).unwrap();
        await dispatch(fetchIngramHaloItems()).unwrap();

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
      setSyncingSubscriptions((prev) => ({
        ...prev,
        [subscriptionId]: true,
      }));
      try {
        await dispatch(
          updateIngramHaloItem({
            id: parseInt(subscriptionId),
            item_synced: false,
          })
        ).unwrap();
        console.log("Unsynced subscription", subscriptionId, subscriptionName);

        // Fetch updated Halo state
        await dispatch(fetchHaloClients()).unwrap();
        await dispatch(fetchHaloItemsForIngram()).unwrap();
        await dispatch(fetchIngramClients()).unwrap();
        await dispatch(fetchIngramHaloItems()).unwrap();
        setSelectedHaloItems({});

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

  const handleUpdateSubscriptionDisabled = async (
    subscriptionId: string,
    value: boolean,
    subscription: any
  ) => {
    try {
      await dispatch(
        updateIngramHaloItem({
          id: parseInt(subscriptionId),
          disabled: value,
          ...subscription, // Include all other subscription details
        })
      ).unwrap();

      // Fetch updated Ingram state
      await dispatch(fetchIngramClients()).unwrap();
      await dispatch(fetchIngramHaloItems()).unwrap();
      await dispatch(fetchHaloClients()).unwrap();
      await dispatch(fetchHaloItemsForIngram()).unwrap();

      toast.success(
        `Successfully updated disabled status for subscription ${subscriptionId}`
      );
    } catch (error) {
      console.error("Error updating disabled status:", error);
      toast.error("Failed to update disabled status. Please try again.");
    }
  };

  const handleUpdateSubscriptionOverride = async (
    subscriptionId: string,
    override: boolean,
    overrideCount: number | null,
    subscription: any
  ) => {
    try {
      await dispatch(
        updateIngramHaloItem({
          id: parseInt(subscriptionId),
          override,
          override_count: overrideCount,
          ...subscription, // Include all other subscription details
        })
      ).unwrap();

      // Update local state
      setOverrideCounts((prev) => ({
        ...prev,
        [subscriptionId]: overrideCount ?? 0,
      }));

      // Fetch updated Ingram state
      await dispatch(fetchIngramClients()).unwrap();
      await dispatch(fetchIngramHaloItems()).unwrap();
      await dispatch(fetchHaloClients()).unwrap();
      await dispatch(fetchHaloItemsForIngram()).unwrap();

      toast.success(
        `Successfully updated override for subscription ${subscriptionId}`
      );
    } catch (error) {
      console.error("Error updating override:", error);
      toast.error("Failed to update override. Please try again.");
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
          await dispatch(fetchIngramHaloItem(parseInt(selectedId))).unwrap();
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
    customerName: string
  ) => {
    console.log("Adding recurring invoice for", subscriptionId, customerName);
    setIsInvoiceDialogOpen(true);
    setAgreementSearch(customerName);
    setSelectedId(subscriptionId);
    dispatch(fetchIngramHaloItem(parseInt(subscriptionId))).unwrap();
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

  return {
    customerSearch,
    setCustomerSearch,
    subscriptionSearch,
    setSubscriptionSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isSyncing,
    setIsSyncing,
    syncedCustomer,
    setSyncedCustomer,
    selectedAgreement,
    setSelectedAgreement,
    overrideCounts,
    setOverrideCounts,
    ingramClients,
    ingramSubscriptions,
    haloClients,
    haloItems,
    currentItem,
    filteredCustomers,
    filteredSubscriptions,
    totalFilteredCustomers,
    paginatedCustomers,
    selectedHaloCustomers,
    setSelectedHaloCustomers,
    handleHaloCustomerSelect,
    handleSyncChanges,
    handleUnsyncChanges,
    handleHaloItemSelect,
    handleUpdateSubscriptionDisabled,
    handleUpdateSubscriptionOverride,
    handleSyncSubscription,
    handleUnsyncSubscription,
    handleCreateRecurringInvoice,
    haloCustomerOptions,
    haloItemOptions,
    handleAgreementSearch,
    handleAddRecurringInvoice,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    agreements,
    setAgreements,
    selectedId,
    setSelectedId,
    isCreatingInvoice,
    setIsCreatingInvoice,
    agreementSearch,
    setAgreementSearch,
    ingramStatus,
    selectedHaloItems,
    syncingSubscriptions,
    setSyncingSubscriptions,
  };
};
