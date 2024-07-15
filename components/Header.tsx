export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Welcome to CST Customer Mapping Dashboard
      </h1>
      <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
        Works with the middleware API for Bitdefender and SentinelOne
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
