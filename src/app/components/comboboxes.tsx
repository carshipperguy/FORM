import { useState, useRef } from "react";
import { Combobox } from "@headlessui/react";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Comboboxes<T>({
  placeholder,
  label,
  options,
  value,
  handleSelectedOption,
}: {
  label: string;
  placeholder: string;
  options: { id: number; name: string }[];
  value: { id: number; name: string } | null;
  handleSelectedOption: (val: { id: number; name: string }) => void;
}) {
  const [query, setQuery] = useState("asd");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((itm) => {
          return itm.name.toLowerCase().includes(query.toLowerCase());
        });

  const option = useRef<any>();

  return (
    <Combobox
      as="div"
      value={value}
      onChange={(value) => {
        if (value) {
          handleSelectedOption(value);
        }
      }}
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        {label}
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          onClick={() => {
            console.log("clicked", option.current);

            option?.current?.click();
          }}
          displayValue={(itm: { [key: string]: string }) => itm?.name}
          placeholder={placeholder}
        />
        <Combobox.Button
          ref={option}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
        >
          {/* <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> */}
          selecticon
        </Combobox.Button>

        {filteredOptions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((itm) => (
              <Combobox.Option
                onChange={(e) => {
                  console.log(e);
                }}
                key={itm.id}
                value={itm}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {itm.name}
                    </span>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        checkicon
                        {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
