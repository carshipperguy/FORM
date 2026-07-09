"use client";
import Image from "next/image";
import Papa from "papaparse";
import { useState, Fragment, ChangeEvent } from "react";
import { Combobox, Transition } from "@headlessui/react";
import {
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  FieldErrors,
  Control,
  FieldValues,
  Controller,
} from "react-hook-form";

import clsx from "clsx";

export default function Location({
  selectedDepartment,
  options,
  onQueryChange,
  control,
  errors,
  id,
  label,
  placeholder,
}: {
  selectedDepartment: string;
  options: {
    id: number;
    value: string;
    label: string;
  }[];
  onQueryChange: (arg: ChangeEvent<HTMLInputElement>) => void;
  id: string;
  label: string;
  errors: FieldErrors<FieldValues>;
  control: Control;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  return (
    <Controller
      name={id}
      control={control}
      rules={{ required: "This is required field" }}
      render={({ field, fieldState }) => (
        <Combobox by="id" {...field}>
          <div className="relative">
            {/* <label
              htmlFor="company"
              className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']"
            >
              {label}
            </label> */}
            <Combobox.Input
              className={clsx(
                "mt-1 block w-full rounded-sm bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none  sm:text-sm",
                fieldState?.error?.message
                  ? "border border-red-500"
                  : "border border-slate-300"
              )}
              displayValue={(person: {
                id: number;
                value: string;
                label: string;
              }) => (selectedDepartment ? person.label : query)}
              onChange={(event) => {
                onQueryChange(event);
                setQuery(event.target.value);
              }}
              placeholder={placeholder}
            />

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              // afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="absolute z-40 top-10 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {options.length === 0 ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  options?.map((person) => (
                    <Combobox.Option
                      key={person?.id}
                      className={({ active }) =>
                        `relative  select-none py-2 px-2 text-gray-900 cursor-pointer ${
                          active && "bg-slate-100"
                        }`
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <div className="flex justify-between">
                          <div className="flex gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-5 h-5 text-slate-300"
                            >
                              <path
                                fill-rule="evenodd"
                                d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                                clip-rule="evenodd"
                              />
                            </svg>

                            <span
                              className={`block truncate ${
                                selected ? "font-bold" : "font-normal"
                              }`}
                            >
                              {person?.label}
                            </span>
                          </div>

                          {selected ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          ) : // <span
                          //   className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          //     active ? "text-white" : "text-teal-600"
                          //   }`}
                          // >
                          //   Check Icon
                          // </span>
                          null}
                        </div>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {fieldState?.error?.message}
            </p>
          </div>
        </Combobox>
      )}
    />
  );
}
