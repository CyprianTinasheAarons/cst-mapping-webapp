import { FaMapMarkedAlt, FaChartLine } from "react-icons/fa";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center flex items-center justify-center gap-3">
        <FaMapMarkedAlt className="text-[#0C797D] animate-pulse" />
        <span className="text-xl font-extrabold uppercase tracking-widest">
          CST Customer Mapping
        </span>
        <FaChartLine className="text-[#0C797D] animate-bounce" />
      </h1>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
