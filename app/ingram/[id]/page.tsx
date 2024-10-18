"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchHaloRecurringInvoices,
  fetchHaloItemById,
  updateHaloInvoice,
} from "@/slices/halo/haloSlice";
import {
  createAutoSyncRecurringInvoice,
  updateAutoSyncRecurringInvoice,
  fetchAllAutoSyncRecurringInvoices,
} from "@/slices/ingram/ingramAutoSyncSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toggle } from "@/components/ui/toggle";

const InvoicesPage: React.FC = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { recurringInvoices, currentItem, itemById } = useAppSelector(
    (state) => state.halo
  );
  const { recurringInvoices: autoSyncInvoices } = useAppSelector(
    (state) => state.ingramAutoSync
  );
  const [customerName, setCustomerName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLineItemsDialogOpen, setIsLineItemsDialogOpen] = useState(false);
  const [isRecurringItemFormOpen, setIsRecurringItemFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [count, setCount] = useState(currentItem?.count || 1);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([
        dispatch(fetchHaloRecurringInvoices(parseInt(id as string))).unwrap(),
        dispatch(fetchAllAutoSyncRecurringInvoices()).unwrap(),
      ])
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        });
    }
    const clientName = searchParams.get("client");
    if (clientName) {
      setCustomerName(clientName);
    }
  }, [id, dispatch, searchParams]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = recurringInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (currentItem) {
      setIsLoading(true);
      dispatch(fetchHaloItemById(currentItem.id))
        .unwrap()
        .then(() => setIsLoading(false))
        .catch((error) => {
          console.error("Error fetching item by ID:", error);
          setIsLoading(false);
        });
    }
  }, [currentItem, dispatch]);

  function negativeToPositive(id: number) {
    if (id < 0) {
      return Math.abs(id) - 9;
    }
    return id;
  }

  const handleAutoSyncToggle = async (invoice: any) => {
    const autoSyncInvoice = autoSyncInvoices.find(
      (asi) => asi.invoice_id === negativeToPositive(invoice.id)
    );

    if (autoSyncInvoice) {
      try {
        await dispatch(
          updateAutoSyncRecurringInvoice({
            invoiceId: autoSyncInvoice.invoice_id,
            autosync: !autoSyncInvoice.autosync,
          })
        ).unwrap();
        toast.success("Auto-sync status updated successfully");
      } catch (error) {
        console.error("Error updating auto-sync status:", error);
        toast.error("Failed to update auto-sync status");
      }
    } else {
      toast.error("Auto-sync record not found for this invoice");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <Button
        variant="outline"
        onClick={() => router.push("/ingram")}
        className="mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
      </Button>
      <h1 className="text-3xl font-bold mb-2">Ingram</h1>
      <h2 className="text-xl font-semibold mb-4">{customerName}</h2>
      <h3 className="text-lg font-medium mb-4">Recurring Invoices</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Contract Ref</TableHead>
            <TableHead>Next Creation Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Auto Sync</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((invoice) => {
            const autoSyncInvoice = autoSyncInvoices.find(
              (asi) => asi.invoice_id === negativeToPositive(invoice.id)
            );
            return (
              <TableRow key={invoice.id}>
                <TableCell>{negativeToPositive(invoice.id)}</TableCell>
                <TableCell>{invoice.client_name}</TableCell>
                <TableCell>{invoice.contract_ref}</TableCell>
                <TableCell>
                  {new Date(invoice.nextcreationdate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsLineItemsDialogOpen(true);
                          }}
                        >
                          View Items
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View line items for this invoice</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsRecurringItemFormOpen(true);
                          }}
                        >
                          Add Item
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add a recurring item to this invoice</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Toggle
                    pressed={autoSyncInvoice?.autosync}
                    onPressedChange={() => handleAutoSyncToggle(invoice)}
                    variant="outline"
                  >
                    {autoSyncInvoice?.autosync ? "Auto Synced" : "Unsynced"}
                  </Toggle>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
          </PaginationItem>
          {[...Array(Math.ceil(recurringInvoices.length / itemsPerPage))].map(
            (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => paginate(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext onClick={() => paginate(currentPage + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog
        open={isLineItemsDialogOpen}
        onOpenChange={setIsLineItemsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Line Items for Invoice {negativeToPositive(selectedInvoice?.id)}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Item Code</TableHead>
                  <TableHead className="w-2/3">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoice?.lines.map((line: any) => (
                  <TableRow key={line.id} className="hover:bg-gray-100">
                    <TableCell className="">{line.item_code}</TableCell>
                    <TableCell className="text-sm">
                      {line.item_shortdescription}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRecurringItemFormOpen}
        onOpenChange={setIsRecurringItemFormOpen}
      >
        <DialogContent>
          <div className="bg-white p-6">
            <h2 className="text-xl font-bold mb-4">Selected Invoice</h2>
            {selectedInvoice ? (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium">Invoice ID:</span>
                  <span>{negativeToPositive(selectedInvoice.id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Client:</span>
                  <span>{selectedInvoice.client_name}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No invoice selected</p>
            )}
            <h3 className="text-lg font-semibold mb-4">Item Details</h3>
            {itemById ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Item Code</p>
                  <p className="mt-1">{itemById.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Item Name</p>
                  <p className="mt-1">{itemById.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="mt-1">{itemById.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Supplier</p>
                  <p className="mt-1">{itemById.supplier_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Count</p>
                  <Input
                    type="number"
                    min="1"
                    defaultValue={count}
                    className="w-20 mt-1"
                    onChange={(e) => {
                      setCount(parseInt(e.target.value));
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No item selected</p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            {itemById !== null ? (
              <Button
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    await dispatch(
                      updateHaloInvoice({
                        id: negativeToPositive(selectedInvoice?.id),
                        client_id: selectedInvoice?.client_id,
                        contract_id: selectedInvoice?.contract_id,
                        items: [
                          {
                            id: itemById.id,
                            count: count,
                            accountsid: selectedInvoice?.accountsid,
                            baseprice: parseFloat(
                              localStorage.getItem("ingram_cost") || "0"
                            ),
                          },
                        ],
                        old_lines: selectedInvoice?.lines,
                      })
                    ).unwrap();

                    const autoSyncInvoice = autoSyncInvoices.find(
                      (asi) => asi.invoice_id === selectedInvoice.id
                    );

                    if (autoSyncInvoice) {
                      return;
                    } else {
                      await dispatch(
                        createAutoSyncRecurringInvoice({
                          agreement_id: selectedInvoice.contract_id,
                          autosync: true,
                          client_id: selectedInvoice.client_id,
                          invoice_id: negativeToPositive(selectedInvoice.id),
                          items: [
                            {
                              id: itemById.id,
                              count: count,
                              baseprice: parseFloat(
                                localStorage.getItem("ingram_cost") || "0"
                              ),
                            },
                          ],
                          old_lines: selectedInvoice.lines,
                        })
                      ).unwrap();
                    }

                    setSelectedInvoice(null);
                    setIsRecurringItemFormOpen(false);
                    toast.success(
                      `Successfully added recurring item to invoice ${negativeToPositive(
                        selectedInvoice.id
                      )}`
                    );
                  } catch (error) {
                    console.error("Error adding recurring item:", error);
                    toast.error(
                      `Failed to add recurring item to invoice ${negativeToPositive(
                        selectedInvoice.id
                      )}`
                    );
                  } finally {
                    setIsSyncing(false);
                  }
                }}
              >
                {isSyncing ? (
                  <BeatLoader color="#ffffff" size={8} />
                ) : (
                  "Add Recurring Item"
                )}
              </Button>
            ) : (
              <Button onClick={() => router.push("/ingram")}>
                Go Select Item
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default InvoicesPage;
