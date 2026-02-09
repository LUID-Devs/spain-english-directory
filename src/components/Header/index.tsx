
import React from "react";

type Props = {
  name: string;
  buttonComponent?: React.ReactNode;
  isSmallText?: boolean;
};

const Header = ({ name, buttonComponent, isSmallText = false }: Props) => {
  return (
    <div className="mb-4 sm:mb-5 flex w-full items-center justify-between gap-3">
      <h1
        className={`${isSmallText ? "text-base sm:text-lg" : "text-xl sm:text-2xl"} font-semibold dark:text-white truncate`}
      >
        {name}
      </h1>
      {buttonComponent}
    </div>
  );
};

export default Header;
