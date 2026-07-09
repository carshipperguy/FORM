/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, forwardRef } from "react";
import { Listbox, Transition } from "@headlessui/react";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type IInputProps = {
  field: any;
  label: string;
  placeholder: string;
  options:
    | { id: number | string; name: string | number }[]
    | { make: string }[]
    | {
        vehicle_id: string;
        type: string;
        year: number;
        make: string;
        model: string;
        original_model: string;
      }[];
  value:
    | { id: number | string; name: string | number }
    | { make: string }
    | {
        vehicle_id: string;
        type: string;
        year: number;
        make: string;
        model: string;
        original_model: string;
      }
    | null;
  isDisabled: boolean;
  ref: any;
  isError: string;
  handleSelectedOption: (
    value:
      | { id: number | string; name: string }
      | { make: string }
      | {
          vehicle_id: string;
          type: string;
          year: number;
          make: string;
          model: string;
          original_model: string;
        }
  ) => void;
};

const Menus = forwardRef<any, IInputProps>(
  (
    {
      label,
      placeholder,
      options,
      value,
      isDisabled,
      field,
      isError,
      handleSelectedOption,
    },
    ref
  ) => (
    <>
      {/* <input ref={ref} placeholder={placeholder} /> */}
      <Listbox
        disabled={isDisabled}
        value={value}
        // {...field}
        // name={field.name}
        // {...field}
        name={field.name}
        onChange={handleSelectedOption}
      >
        {({ open }) => (
          <>
            {/* <Listbox.Label className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']">
              {label}
            </Listbox.Label> */}

            <div className="mt-1 relative">
              <Listbox.Button
                className={`disabled:bg-gray-200 bg-white relative w-full border ${
                  isError && !isDisabled ? "border-red-400" : "border-gray-300"
                } rounded-sm shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none  sm:text-sm`}
              >
                <span className="block truncate">
                  {(() => {
                    if (!value)
                      return (
                        <span className="text-gray-400">{placeholder}</span>
                      );
                    if ("model" in value) {
                      return value?.model;
                    }
                    if ("name" in value) {
                      return value?.name;
                    }
                    if ("make" in value) {
                      return value?.make;
                    }
                  })()}
                </span>
                <span
                  className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                  ref={ref}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {options.length == 0 ? (
                    <Listbox.Option
                      disabled
                      value={null}
                      className={({ active }) =>
                        classNames(
                          active ? "text-white bg-[#042434]" : "text-gray-900",
                          "cursor-default select-none relative py-2 pl-3 pr-9"
                        )
                      }
                    >
                      Nothing Found
                    </Listbox.Option>
                  ) : (
                    options.map((itm, index) => (
                      <Listbox.Option
                        key={index}
                        className={({ active }) =>
                          classNames(
                            active
                              ? "text-white bg-[#042434]"
                              : "text-gray-900",
                            "cursor-default select-none relative py-2 pl-3 pr-9"
                          )
                        }
                        value={itm}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? "font-bold" : "font-normal",
                                "block truncate"
                              )}
                            >
                              {(() => {
                                if ("name" in itm) {
                                  return itm.name;
                                }
                                if ("model" in itm) {
                                  return itm.model;
                                }
                                if ("make" in itm) {
                                  return itm.make;
                                }
                              })()}
                            </span>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? "text-white" : "text-[#042434]",
                                  "absolute inset-y-0 right-0 flex items-center pr-4"
                                )}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </svg>
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))
                  )}
                </Listbox.Options>
              </Transition>
            </div>

            <p className="mt-2 text-sm text-red-600" id="email-error">
              {isError}
            </p>
          </>
        )}
      </Listbox>
    </>
  )
);

export default Menus;
