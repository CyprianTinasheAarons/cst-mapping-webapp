"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MiddlewareService from "@/api/middleware";

interface TableFormProps {
  data: {
    id: number;
    name: string;
    disabled: boolean;
    override: boolean;
    override_count: number;
    bitdefendername: string;
    sentinelonename: string;
    bitdefenderoverride: boolean;
    bitdefenderoverridecount: number;
    sentineloneoverride: boolean;
    sentineloneoverridecount: number;
  }[];
}

const TableForm: React.FC<TableFormProps> = ({ data }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editedData, setEditedData] = useState(data);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleDisabledStatus = async (rowId: number) => {
    setEditedData((prevData) =>
      prevData.map((row) =>
        row.id === rowId ? { ...row, disabled: !row.disabled } : row
      )
    );

    try {
      const response = await MiddlewareService.toggleClientDisabledStatus({
        client_id: rowId,
      });
      if (response.status === 200) {
        // Handle successful response
        console.log("Disabled status updated successfully");
        toast({
          title: "Success",
          description: "Disabled status updated successfully",
        });
        router.refresh();
      } else {
        // Handle error response
        console.error("Failed to update disabled status");
        toast({
          title: "Error",
          description: "Failed to update disabled status",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating disabled status:", error);
      toast({
        title: "Error",
        description: "Error updating disabled status",
      });
      router.refresh();
    }
  };

  const handleSave = async (
    rowId: number,
    enable: boolean,
    overrideCount: number
  ) => {
    try {
      const response = await MiddlewareService.setBitdefenderOverrideStatus({
        client_id: rowId,
        enable: enable,
        count: overrideCount,
      });
      if (response.status === 200) {
        // Handle successful response
        console.log("Override count updated successfully");
        toast({
          title: "Success",
          description: "Override count updated successfully",
        });
        router.refresh();
      } else {
        // Handle error response
        console.error("Failed to update override count");
        toast({
          title: "Error",
          description: "Failed to update override count",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating override count:", error);
      toast({
        title: "Error",
        description: "Error updating override count",
      });
      router.refresh();
    }
  };

  const handleInputChange = (rowId: number, field: string, value: any) => {
    setEditedData((prevData) =>
      prevData.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const renderRows = () => {
    return editedData
      .filter((row) =>
        row.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(
            searchTerm
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          )
      )
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map((row) => (
        <TableRow key={row.id}>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            {row.bitdefendername}
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            {row.name}
          </TableCell>
          <TableCell className="w-[150px] text-sm border border-gray-300 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.disabled}
                onChange={() => handleToggleDisabledStatus(row.id)}
                className="cursor-pointer h-5 w-5"
              />
              <label className="text-lg font-medium">
                {row.disabled ? "Yes" : "No"}
              </label>
            </div>
          </TableCell>
          <TableCell className="w-[150px] text-sm border border-gray-300 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.bitdefenderoverride}
                onChange={() =>
                  handleInputChange(
                    row.id,
                    "bitdefenderoverride",
                    !row.bitdefenderoverride
                  )
                }
                className="cursor-pointer h-5 w-5"
              />
              <label className="text-lg font-medium">
                {row.bitdefenderoverride ? "Yes" : "No"}
              </label>
            </div>
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            <Input
              placeholder="Number"
              type="text"
              value={row.bitdefenderoverridecount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handleInputChange(
                  row.id,
                  "bitdefenderoverridecount",
                  isNaN(value) ? 0 : value
                );
              }}
            />
          </TableCell>

          <TableCell className="w-[150px] text-xs border border-gray-300 cursor-pointer">
            <Button
              variant="outline"
              onClick={() =>
                handleSave(
                  row.id,
                  row.bitdefenderoverride,
                  row.bitdefenderoverridecount
                )
              }
            >
              Save
            </Button>
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-[90vh]">
      <div className="sticky top-0 bg-white z-10 w-full">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4"
        />{" "}
        <div className="mt-2 text-sm text-right py-2">
          Page {currentPage} of {totalPages}
        </div>
        <div className="overflow-x-auto w-full">
          <Table className="border border-gray-300">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] text-xs border border-gray-300">
                  Bitdefender Customer
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-gray-300">
                  Halo Customer
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-gray-300">
                  Disable Sync?
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-t-gray-300">
                  Override
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-t-gray-300">
                  Override Amount
                </TableHead>

                <TableHead className="w-[150px] text-xs border border-gray-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>
      <div className="overflow-x-auto w-full flex-1">
        <Table className="border border-gray-300">
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </div>

      <div className="py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" onClick={() => handlePageChange(1)}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => handlePageChange(Math.ceil(totalPages / 2))}
              >
                {Math.ceil(totalPages / 2)}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TableForm;
