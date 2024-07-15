"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const renderRows = () => {
    return data
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
          <TableCell className="w-[150px] text-xs border border-gray-300">{row.bitdefendername}</TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">{row.name}</TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            <div className="flex items-center">
              <Toggle className="mx-2">{row.override ? "Yes" : "No"}</Toggle>
            </div>
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            <Input
              placeholder="Number"
              type="number"
              value={row.override_count}
            />
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            <div className="flex items-center">
              <Toggle className="mx-2">{row.disabled ? "Yes" : "No"}</Toggle>
            </div>
          </TableCell>
          <TableCell className="w-[150px] text-xs border border-gray-300">
            <Popover>
              <PopoverTrigger>
                <Button variant="outline">Save</Button>
              </PopoverTrigger>
              <PopoverContent>
                Are you sure you want to save?
                <div className="flex justify-end mt-2">
                  <Button variant="outline" className="mr-2">
                    Yes
                  </Button>
                  <Button variant="outline">No</Button>
                </div>
              </PopoverContent>
            </Popover>
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
        />
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
                  Override
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-gray-300">
                  Override Amount
                </TableHead>
                <TableHead className="w-[150px] text-xs border border-gray-300">
                  Disable Sync?
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
        <div className="mt-2 text-sm text-center">
          Page {currentPage} of {totalPages}
        </div>
      </Pagination>
    </div>
  );
};

export default TableForm;
