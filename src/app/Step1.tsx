import React from "react";
import Image from "next/image";
import Papa from "papaparse";
import { useState, Fragment, useEffect, ChangeEvent } from "react";
import { Combobox, Transition } from "@headlessui/react";
import Location from "./location";
import {
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  FieldErrors,
  Control,
  FieldValues,
  Controller,
  UseFormWatch,
} from "react-hook-form";

const Step1 = ({
  errors,
  control,
  watch,
}: {
  watch: UseFormWatch<FieldValues>;
  errors: FieldErrors<FieldValues>;
  control: Control;
}) => {
  const [locations, setLocations] = useState<
    { id: number; value: string; label: string }[]
  >([]);
  const [options, setOptions] = useState<
    { id: number; value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      var results = Papa.parse(
        "https://gist.githubusercontent.com/Tucker-Eric/6a1a6b164726f21bb699623b06591389/raw/d87104248e4796f872412993a8b43d583c889176/us_zips.csv",
        {
          download: true,
          // rest of config ...
          complete: async (response: { data: string[] }) => {
            let results = response.data;
            let [column_data, ...values] = results;
            // You can access the data here
            // console.log({ response });
            let filtered_values = values.map((value, index) => ({
              id: index,
              value:
                value[0] + " " + value[1] + " " + value[2] + " " + value[3],
              label: value[1] + "," + value[3] + " " + value[0] + ",USA",
            }));
            const people = [
              { id: 1, value: "Wade Cooper", label: "Wade Cooper" },
              { id: 2, value: "Arlene Mccoy", label: "Arlene Mccoy" },
              { id: 3, value: "Devon Webb", label: "Devon Webb" },
              { id: 4, value: "Tom Cook", label: "Tom Cook" },
              { id: 5, value: "Tanya Fox", label: "Tanya Fox" },
              { id: 6, value: "Hellen Schmidt", label: "Hellen Schmidt" },
            ];
            setLocations(
              filtered_values as { id: number; value: string; label: string }[]
            );
          },
        }
      );
    };
    fetchData();
  }, []);
  return (
    <div className="border border-slate-200">
      <div className="disabled:opacity-40 disabled:cursor-not-allowed rounded-sm text-sm font-normal relative block w-full group items-center justify-start px-2 py-2  active:shadow-none shadow-lg bg-gradient-to-tr from-[#042434] to-[#052f44] border-[#063a54] text-white">
        Origin & Destination
      </div>
      <div className="p-2">
        <Location
          id={"origin_destination.transport_car_from"}
          selectedDepartment={watch("origin_destination.transport_car_from")}
          label={"Ship From"}
          placeholder="Ship From"
          options={options}
          control={control}
          errors={errors}
          onQueryChange={(event: ChangeEvent<HTMLInputElement>) => {
            const filteredPeople = locations.filter(
              (person) =>
                person.value
                  .toLowerCase()
                  .replace(/\s+/g, "")
                  .includes(
                    event.target.value.toLowerCase().replace(/\s+/g, "")
                  ) ||
                person.label
                  .toLowerCase()
                  .replace(/\s+|\W+/g, "")
                  .includes(
                    event.target.value.toLowerCase().replace(/\s+|\W+/g, "")
                  )
            );
            const takeFirstFiveItems = [0, 1, 2, 3, 4].flatMap((index) =>
              filteredPeople[index] ? [filteredPeople[index]] : []
            );

            setOptions(takeFirstFiveItems);
          }}
        />{" "}
        <div className="mt-2">
          <Location
            id={"origin_destination.transport_car_to"}
            selectedDepartment={watch("origin_destination.transport_car_to")}
            label={"Ship To"}
            placeholder="Ship To"
            options={options}
            control={control}
            errors={errors}
            onQueryChange={(event: any) => {
              const filteredPeople = locations.filter(
                (person) =>
                  person.value
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(
                      event.target.value.toLowerCase().replace(/\s+/g, "")
                    ) ||
                  person.label
                    .toLowerCase()
                    .replace(/\s+|\W+/g, "")
                    .includes(
                      event.target.value.toLowerCase().replace(/\s+|\W+/g, "")
                    )
              );
              const takeFirstFiveItems = [0, 1, 2, 3, 4].flatMap((index) =>
                filteredPeople[index] ? [filteredPeople[index]] : []
              );

              setOptions(takeFirstFiveItems);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;
