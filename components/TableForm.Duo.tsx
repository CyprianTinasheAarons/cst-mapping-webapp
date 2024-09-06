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
    sentinelonedisabled: boolean;
    bitdefenderdisabled: boolean;
    duodisabled: boolean;
    override: boolean;
    override_count: number;
    bitdefendername: string;
    sentinelonename: string;
    bitdefenderoverride: boolean;
    bitdefenderoverridecount: number;
    sentineloneoverride: boolean;
    sentineloneoverridecount: number;
    duooverride: boolean;
    duooverridecount: number;
    duoname: string;
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
      const response = await MiddlewareService.toggleDuoDisabledStatus({
        client_id: rowId,
      });
      if (response.status === 200) {
        console.log("Disabled status updated successfully");
        toast({
          title: "Success",
          description: "Disabled status updated successfully",
        });
        router.refresh();
      } else {
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
      const response = await MiddlewareService.setDuoOverrideStatus({
        client_id: rowId,
        enable: enable,
        count: overrideCount,
      });
      if (response.status === 200) {
        console.log("Override count updated successfully");
        toast({
          title: "Success",
          description: "Override count updated successfully",
        });
        router.refresh();
      } else {
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
          <TableCell className="w-[150px] text-xs border border-[#0C797D]/20">
            {row.duoname}
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-[#0C797D]/20">
            {row.name}
          </TableCell>
          <TableCell className="w-[150px] text-sm border border-[#0C797D]/20 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.duodisabled}
                onChange={() => handleToggleDisabledStatus(row.id)}
                className="cursor-pointer h-5 w-5 text-[#0C797D] border-[#0C797D] rounded focus:ring-[#0C797D]"
              />
              <label className="text-xs uppercase text-[#0C797D]">
                {row.duodisabled ? "Yes" : "No"}
              </label>
            </div>
          </TableCell>
          <TableCell className="w-[150px] text-sm border border-[#0C797D]/20 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.duooverride}
                onChange={() =>
                  handleInputChange(row.id, "duooverride", !row.duooverride)
                }
                className="cursor-pointer h-5 w-5 text-[#0C797D] border-[#0C797D] rounded focus:ring-[#0C797D]"
              />
              <label className="text-xs uppercase text-[#0C797D]">
                {row.duooverride ? "Yes" : "No"}
              </label>
            </div>
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-[#0C797D]/20">
            <Input
              placeholder="Number"
              type="text"
              value={row.duooverridecount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handleInputChange(
                  row.id,
                  "duooverridecount",
                  isNaN(value) ? 0 : value
                );
              }}
              className="border-[#0C797D] focus:ring-[#0C797D] focus:border-[#0C797D]"
            />
          </TableCell>

          <TableCell className="w-[150px] text-xs border border-[#0C797D]/20 cursor-pointer">
            <Button
              variant="outline"
              onClick={() =>
                handleSave(row.id, row.duooverride, row.duooverridecount)
              }
              className="bg-[#0C797D] text-white hover:bg-[#0C797D]/80 w-full"
            >
              Save
            </Button>
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-[90vh]">
      <div className="sticky top-0 bg-white z-10 w-full p-4 shadow-md">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4 border-[#0C797D] focus:ring-[#0C797D] focus:border-[#0C797D]"
        />
        <div className="mt-2 text-sm text-right py-2 text-[#0C797D]">
          Page {currentPage} of {totalPages}
        </div>
        <div className="overflow-x-auto w-full">
          <Table className="border border-[#0C797D]/20">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] text-xs border border-[#0C797D]/20 bg-[#0C797D] text-white">
                  Duo Customer
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-[#0C797D]/20 bg-[#0C797D] text-white">
                  Halo Customer
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-[#0C797D]/20 bg-[#0C797D] text-white">
                  Disable Sync?
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-[#0C797D]/20 bg-[#0C797D] text-white">
                  Override
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-[#0C797D]/20 bg-[#0C797D] text-white">
                  Override Amount
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-[#0C797D]/20 bg-[#0C797D] text-white">
                  Save Override
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>
      <div className="overflow-x-auto w-full flex-1">
        <Table className="border border-[#0C797D]/20">
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
                className="text-[#0C797D] hover:bg-[#0C797D]/10"
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => handlePageChange(1)}
                className="text-[#0C797D] hover:bg-[#0C797D]/10"
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis className="text-[#0C797D]" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => handlePageChange(Math.ceil(totalPages / 2))}
                className="text-[#0C797D] hover:bg-[#0C797D]/10"
              >
                {Math.ceil(totalPages / 2)}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis className="text-[#0C797D]" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => handlePageChange(totalPages)}
                className="text-[#0C797D] hover:bg-[#0C797D]/10"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-[#0C797D] hover:bg-[#0C797D]/10"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TableForm;
