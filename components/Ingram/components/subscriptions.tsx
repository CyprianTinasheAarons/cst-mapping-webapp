"use client";
import React from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  AlertCircle,
  RefreshCw,
  Lock,
  Hash,
  Unlock,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BeatLoader } from "react-spinners";
import { ComboboxDemo } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import PaginationComponent from "./pagination";
import { useIngramSync } from "./hooks";
import { useRouter } from "next/navigation";

const Subscriptions = () => {
  const {
    customerSearch,
    setCustomerSearch,
    filteredCustomers,
    ingramStatus,
    filteredSubscriptions,
    haloItems,
    selectedHaloItems,
    handleHaloItemSelect,
    handleSyncSubscription,
    handleUnsyncSubscription,
    handleAddRecurringInvoice,
    syncingSubscriptions,
    isCreatingInvoice,
    overrideCounts,
    handleUpdateSubscriptionDisabled,
    handleUpdateSubscriptionOverride,
    haloItemOptions,
    totalFilteredCustomers,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    setSelectedAgreement,
    setAgreementSearch,
    agreementSearch,
    agreements,
    selectedAgreement,
    handleAgreementSearch,
  } = useIngramSync();

  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
            <TableHead>Company & Subscriptions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingramStatus === "loading" ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8"></TableCell>
            </TableRow>
          ) : filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No customers found
                </p>
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map((customer) => (
              <React.Fragment key={customer.customer_ingram_id}>
                <TableRow>
                  <TableCell className="font-medium bg-muted" colSpan={4}>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <span className="text-lg">{customer.ingram_name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({customer.customer_ingram_id})
                        </span>
                      </div>
                      <Badge variant="outline">
                        {filteredSubscriptions.filter(
                          (sub) =>
                            sub.customer_ingram_id ===
                            customer.customer_ingram_id
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
                          This customer has not been synced with Halo PSA.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TableCell>
                </TableRow>

                {filteredSubscriptions.filter(
                  (sub) =>
                    sub.customer_ingram_id === customer.customer_ingram_id
                ).length > 0 ? (
                  filteredSubscriptions
                    .filter(
                      (sub) =>
                        sub.customer_ingram_id === customer.customer_ingram_id
                    )
                    .map((subscription) => (
                      <TableRow
                        key={`${customer.customer_ingram_id}-${subscription.id}`}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {subscription.item_ingram_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {subscription.item_ingram_id}
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
                                    const selectedItem = haloItems.find(
                                      (item) => item.name === value
                                    );

                                    if (selectedItem) {
                                      handleHaloItemSelect(
                                        subscription.id,
                                        selectedItem.id,
                                        selectedItem.name
                                      );
                                    }
                                  }}
                                  placeholder="Halo Subscription"
                                  selectedValue={
                                    selectedHaloItems[subscription.id]?.id
                                  }
                                />
                              )}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <RefreshCw className="h-4 w-4" />
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
                                          subscription.item_ingram_name
                                        )
                                      }
                                      disabled={
                                        subscription.item_synced ||
                                        !selectedHaloItems[subscription.id] ||
                                        syncingSubscriptions[subscription.id]
                                      }
                                    >
                                      {syncingSubscriptions[subscription.id] ? (
                                        <BeatLoader color="#0C797D" size={8} />
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
                                          subscription.item_ingram_name
                                        );
                                      }}
                                      disabled={
                                        syncingSubscriptions[subscription.id]
                                      }
                                    >
                                      {syncingSubscriptions[subscription.id] ? (
                                        <BeatLoader color="#0C797D" size={8} />
                                      ) : (
                                        "Unsync Subscription"
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="justify-start"
                                      onClick={() => {
                                        handleAddRecurringInvoice(
                                          subscription.id,
                                          customer.halo_name
                                        );
                                        setIsInvoiceDialogOpen(true);
                                        setSelectedAgreement(null);
                                        setAgreementSearch(customer.halo_name);
                                      }}
                                    >
                                      {isCreatingInvoice ? (
                                        <BeatLoader color="#ffffff" size={8} />
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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Checkbox
                                      id={`disabled-${subscription.id}`}
                                      checked={subscription.disabled}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked as boolean;
                                        handleUpdateSubscriptionDisabled(
                                          subscription.id,
                                          newValue,
                                          {
                                            ...subscription,
                                            disabled: newValue,
                                          }
                                        );
                                      }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {subscription.disabled
                                        ? "Enable"
                                        : "Disable"}{" "}
                                      this subscription
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <label
                                htmlFor={`disabled-${subscription.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {subscription.disabled ? (
                                  <Unlock className="h-4 w-4 inline-block mr-2" />
                                ) : (
                                  <Lock className="h-4 w-4 inline-block mr-2" />
                                )}
                                {subscription.disabled ? "Enable" : "Disable"}
                              </label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Hash className="h-4 w-4" />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Input
                                      type="number"
                                      className="w-32 h-8"
                                      value={
                                        overrideCounts[subscription.id] ??
                                        subscription.override_count ??
                                        ""
                                      }
                                      min="0"
                                      onChange={(e) => {
                                        const value = Math.max(
                                          0,
                                          parseInt(e.target.value) || 0
                                        );
                                        handleUpdateSubscriptionOverride(
                                          subscription.id,
                                          true,
                                          value,
                                          {
                                            ...subscription,
                                            override_count: value,
                                          }
                                        );
                                      }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Set override count for this subscription
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Checkbox
                                      id={`override-${subscription.id}`}
                                      checked={subscription.override}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked as boolean;
                                        handleUpdateSubscriptionOverride(
                                          subscription.id,
                                          newValue,
                                          overrideCounts[subscription.id] ??
                                            subscription.override_count,
                                          {
                                            ...subscription,
                                            override: newValue,
                                          }
                                        );
                                      }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Override this subscription</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
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
                      onClick={() => {
                        setSelectedAgreement(agreement);
                        router.push(
                          `/ingram/${agreement.id}?client=${agreement.client_name}`
                        );
                      }}
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
          </div>
        </DialogContent>
      </Dialog>
         <PaginationComponent
        currentPage={currentPage}
        totalItems={totalFilteredCustomers}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Subscriptions;
