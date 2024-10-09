"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchHaloRecurringInvoices,
  fetchHaloItemById,
} from "@/slices/halo/haloSlice";
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

const InvoicesPage: React.FC = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { recurringInvoices, currentItem, itemById } = useAppSelector(
    (state) => state.halo
  );
  const [customerName, setCustomerName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLineItemsDialogOpen, setIsLineItemsDialogOpen] = useState(false);
  const [isRecurringItemFormOpen, setIsRecurringItemFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchHaloRecurringInvoices(parseInt(id as string))).unwrap();
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
      dispatch(fetchHaloItemById(currentItem.item_code)).unwrap();
    }
  }, [currentItem, dispatch]);

  return (
    <div className="p-6 min-h-screen">
      <Button
        variant="outline"
        onClick={() => router.push("/ingram")}
        className="mb-4"
      >
        Back to Ingram Dashboard
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.id}</TableCell>
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
                        View Line Items
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View line items for this invoice</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                          setIsRecurringItemFormOpen(true);
                        }}
                      >
                        Add Recurring Item
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a recurring item to this invoice</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />
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
            <PaginationNext
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage ===
                Math.ceil(recurringInvoices.length / itemsPerPage)
              }
            />
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
              Line Items for Invoice {selectedInvoice?.id}
            </DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedInvoice?.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.item_code}</TableCell>
                  <TableCell>{line.item_shortdescription}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">
                      Sync
                    </Button>
                    <Button variant="outline" size="sm">
                      Unsync
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRecurringItemFormOpen}
        onOpenChange={setIsRecurringItemFormOpen}
      >
        <DialogContent>
          <div className="bg-white  p-6">
            <h3 className="text-lg font-semibold mb-4">Item Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Item Name</p>
                <p className="mt-1">{itemById?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1">{itemById?.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Base Price</p>
                <p className="mt-1">${itemById?.baseprice}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier</p>
                <p className="mt-1">
                  {itemById?.supplier_name || "Ingram Micro Global BV"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Supplier Part Code
                </p>
                <p className="mt-1">{itemById?.supplier_part_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Asset Group</p>
                <p className="mt-1">{itemById?.assetgroup_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Count</p>
                <Input
                  type="number"
                  min="1"
                  defaultValue={currentItem?.count || 1}
                  className="w-20 mt-1"
                  onChange={(e) => {
                    /* Handle count change */
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                /* Add logic to handle recurring item addition */
              }}
            >
              Add Recurring Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;
