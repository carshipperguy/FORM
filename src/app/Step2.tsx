import React, { useRef, createRef, useEffect, useState } from "react";
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

import { IFormInput } from "./page";
import Comboboxes from "./components/comboboxes";
import Menus from "./components/menus";
import usePersistedState from "./usePersistedState";

const notificationMethods = [
  { id: "Yes", title: "Yes" },
  { id: "No", title: "No" },
];

const Step2 = ({
  errors,
  register,
  watch,
  setValue,
  clearErrors,
  control,
}: {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  watch: UseFormGetValues<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  clearErrors: UseFormClearErrors<FieldValues>;
  control: Control;
}) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [vehicleCompanies, setVehicleCompanies] = usePersistedState<{
    [key: string]: { make: string }[];
  }>("vehicleCompanies", {});
  const [vehicleModels, setVehicleModels] = usePersistedState<{
    [key: string]: {
      vehicle_id: string;
      type: string;
      year: number;
      make: string;
      model: string;
      original_model: string;
    }[];
  }>("vehicleModels", {});

  // Function to generate the array of objects from 1899 to 2024
  function generateYearObjects(startYear: number, endYear: number) {
    const yearsArray = [];

    for (let year = startYear; year <= endYear; year++) {
      yearsArray.push({ id: year - startYear + 1, name: year });
    }

    return yearsArray;
  }

  // Generate the array of objects from 1899 to 2024
  const arrayOfObjects = generateYearObjects(1899, 2024);

  const years = generateYearObjects(1899, 2024).reverse();

  const companyRef = createRef<any>();
  const vehicleRef = createRef<any>();
  const vehicleTypeRef = createRef<any>();
  const vehicleYearRef = createRef<any>();

  const otherVehicleYearRef = useRef<any>(null);
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    setValue("vehicle_details.year", null);
    setValue("vehicle_details.company", null);
    setValue("vehicle_details.vehicle_name", null);
    vehicleYearRef.current?.click();
  }, [watch("vehicle_details.vehicle_type")]);
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    companyRef.current?.click();
  }, [watch("vehicle_details.year")]);
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    vehicleRef.current?.click();
  }, [watch("vehicle_details.company")]);

  const vehicleTypes = [
    { id: "car/truck/suv", name: "Car/Truck/Suv" },
    { id: "boat", name: "Boat" },
    { id: "golf_cart", name: "Golf Cart" },
    { id: "motorcycle", name: "Motorcycle" },
    { id: "rv_5th_wheel", name: "Rv/5th Wheel" },
    { id: "travel_trailer", name: "Travel Trailer" },
  ];
  console.log({ errors });
  return (
    <div className="border border-slate-200 mt-2">
      <div className="disabled:opacity-40 text-sm disabled:cursor-not-allowed rounded-sm font-normal relative block w-full group items-center justify-start px-2 py-2  active:shadow-none shadow-lg bg-gradient-to-tr from-[#042434] to-[#052f44] border-[#063a54] text-white">
        Vehicle Details
      </div>
      <div className="p-2">
        <div>
          <Controller
            name={"vehicle_details.vehicle_type"}
            control={control}
            rules={{ required: "This is required field" }}
            render={({ field, fieldState }) => (
              <>
                <Menus
                  field={field}
                  label="What Would You Like To Ship?"
                  placeholder="What Would You Like To Ship?"
                  options={vehicleTypes}
                  ref={vehicleTypeRef}
                  value={
                    vehicleTypes.find(
                      (year) =>
                        year?.id == watch("vehicle_details.vehicle_type")?.id
                    ) || null
                  }
                  handleSelectedOption={(selectedOption) => {
                    setValue("vehicle_details.vehicle_type", selectedOption);
                    clearErrors("vehicle_details.vehicle_type");
                    // otherVehicleYearRef.current?.focus();
                  }}
                  isDisabled={false}
                  isError={fieldState?.error?.message || ""}
                />
              </>
            )}
          />
        </div>

        {watch("vehicle_details.vehicle_type")?.id !== "car/truck/suv" && (
          <>
            <div className="mt-2">
              <Controller
                name={"vehicle_details.year"}
                control={control}
                rules={{ required: "This is required field" }}
                render={({ field, fieldState }) => (
                  <div>
                    {/* <label
                      htmlFor="year"
                      className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']"
                    >
                      Vehicle Year
                    </label> */}
                    <div className="mt-1">
                      <input
                        {...field}
                        value={field.value || ""}
                        type="text"
                        id="year"
                        className={clsx(
                          "mt-1 block w-full rounded-sm bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none sm:text-sm",
                          fieldState?.error?.message
                            ? "border border-red-500"
                            : "border border-slate-300"
                        )}
                        placeholder="Year"
                        // ref={otherVehicleYearRef}
                        // onChange={(e) => setValue("year", e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {fieldState?.error?.message}
                    </p>
                  </div>
                )}
              />
            </div>

            <div className="mt-2">
              <Controller
                name={"vehicle_details.company"}
                control={control}
                rules={{ required: "This is required field" }}
                render={({ field, fieldState }) => (
                  <div>
                    {/* <label
                      htmlFor="vehicle_details.company"
                      className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']"
                    >
                      Vehicle Make
                    </label> */}
                    <div className="mt-1">
                      <input
                        {...field}
                        value={field.value || ""}
                        id="vehicle_details.company"
                        type="vehicle_details.company"
                        className={clsx(
                          "mt-1 block w-full rounded-sm bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none  sm:text-sm",
                          fieldState?.error?.message
                            ? "border border-red-500"
                            : "border border-slate-300"
                        )}
                        placeholder="Vehicle Make"
                        // onChange={(e) => setValue("vehicle_details.company", e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {fieldState?.error?.message}
                    </p>
                  </div>
                )}
              />
            </div>

            <div className="mt-2">
              <Controller
                name={"vehicle_details.vehicle_name"}
                control={control}
                rules={{ required: "This is required field" }}
                render={({ field, fieldState }) => (
                  <div>
                    {/* <label
                      htmlFor="model"
                      className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']"
                    >
                      Vehicle Model
                    </label> */}
                    <div className="mt-1">
                      <input
                        {...field}
                        value={field.value || ""}
                        id="model"
                        type="text"
                        className={clsx(
                          "mt-1 block w-full rounded-sm bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none  sm:text-sm",
                          fieldState?.error?.message
                            ? "border border-red-500"
                            : "border border-slate-300"
                        )}
                        placeholder="Model"
                        // onChange={(e) => setValue("vehicle_details.vehicle_name", e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {fieldState?.error?.message}
                    </p>
                  </div>
                )}
              />
            </div>
          </>
        )}

        {watch("vehicle_details.vehicle_type")?.id === "car/truck/suv" && (
          <>
            <Controller
              name={"vehicle_details.year"}
              control={control}
              rules={{ required: "This is required field" }}
              render={({ field, fieldState }) => (
                <Menus
                  field={field}
                  label="Vehicle Year"
                  placeholder="Select"
                  options={years}
                  ref={vehicleYearRef}
                  value={
                    years.find(
                      (year) => year?.id == watch("vehicle_details.year")?.id
                    ) || null
                  }
                  handleSelectedOption={async (selectedOption) => {
                    try {
                      if ("name" in selectedOption) {
                        let arrayOfVehicles: { make: string }[] =
                          vehicleCompanies[selectedOption.name] || [];
                        if (!vehicleCompanies[selectedOption.name]) {
                          const fetchVehicleCompany = await fetch(
                            `https://done.ship.cars/makes/?year=${selectedOption.name}`
                          );
                          const jsonResp = await fetchVehicleCompany.json();
                          arrayOfVehicles = jsonResp;
                        }

                        setVehicleCompanies(
                          (prev: { [key: string]: { make: string }[] }) => ({
                            ...prev,
                            [selectedOption.name]: arrayOfVehicles,
                          })
                        );
                        setValue("vehicle_details.year", selectedOption);
                        //clear error for year
                        clearErrors("vehicle_details.year");
                        setValue("vehicle_details.company", null);
                        setValue("vehicle_details.vehicle_name", null);
                      }
                    } catch (err) {
                    } finally {
                    }

                    // companyRef.current?.click();
                  }}
                  isDisabled={false}
                  isError={fieldState?.error?.message || ""}
                />
              )}
            />

            <div className="mt-2">
              <Controller
                name={"vehicle_details.company"}
                control={control}
                rules={{ required: "This is required field" }}
                render={({ field, fieldState }) => (
                  <div>
                    <Menus
                      label="Vehicle Make"
                      placeholder="Select"
                      field={field}
                      options={
                        vehicleCompanies[
                          watch("vehicle_details.year")
                            ?.name as keyof typeof vehicleCompanies
                        ] || []
                      }
                      value={
                        vehicleCompanies[
                          watch("vehicle_details.year")
                            ?.name as keyof typeof vehicleCompanies
                        ]?.find(
                          (vehicleCompany) =>
                            vehicleCompany.make ==
                            watch("vehicle_details.company")?.make
                        ) || null
                      }
                      handleSelectedOption={async (selectedOption) => {
                        try {
                          if ("make" in selectedOption) {
                            let arrayOfVehicleModels: {
                              vehicle_id: string;
                              type: string;
                              year: number;
                              make: string;
                              model: string;
                              original_model: string;
                            }[] =
                              vehicleModels[
                                selectedOption.make +
                                  "__" +
                                  watch("vehicle_details.year").name
                              ] || null;

                            if (!arrayOfVehicleModels) {
                              const fetchVehicleModels = await fetch(
                                `https://done.ship.cars/models/?year=${
                                  watch("vehicle_details.year").name
                                }&make=${selectedOption.make}`
                              );
                              const jsonResp = await fetchVehicleModels.json();

                              arrayOfVehicleModels = jsonResp;
                            }

                            setVehicleModels(
                              (prev: {
                                [key: string]: {
                                  vehicle_id: string;
                                  type: string;
                                  year: number;
                                  make: string;
                                  model: string;
                                  original_model: string;
                                }[];
                              }) => ({
                                ...prev,
                                [selectedOption.make +
                                "__" +
                                watch("vehicle_details.year").name]:
                                  arrayOfVehicleModels,
                              })
                            );
                            //set value for vehicle_details.company
                            setValue("vehicle_details.company", selectedOption);
                            //clear error for vehicle_details.company
                            clearErrors("vehicle_details.company");
                            setValue("vehicle_details.vehicle_name", null);
                          }
                        } catch (err) {
                        } finally {
                        }
                      }}
                      ref={companyRef}
                      isDisabled={!watch("vehicle_details.year")}
                      isError={fieldState?.error?.message || ""}
                    />
                  </div>
                )}
              />
            </div>
            <div className="mt-2">
              <Controller
                name={"vehicle_details.vehicle_name"}
                control={control}
                rules={{ required: "This is required field" }}
                render={({ field, fieldState }) => (
                  <Menus
                    field={field}
                    label="Vehicle Model"
                    placeholder="Select"
                    options={
                      vehicleModels[
                        (watch("vehicle_details.company")?.make +
                          "__" +
                          watch("vehicle_details.year")?.name) as string
                      ] || []
                    }
                    ref={vehicleRef}
                    value={
                      vehicleModels[
                        (watch("vehicle_details.company")?.make +
                          "__" +
                          watch("vehicle_details.year")?.name) as string
                      ]?.find(
                        (vehicle_model) =>
                          vehicle_model.vehicle_id ==
                          watch("vehicle_details.vehicle_name")?.vehicle_id
                      ) || null
                    }
                    handleSelectedOption={(selectedOption) => {
                      if (
                        "vehicle_id" in selectedOption &&
                        "type" in selectedOption &&
                        "year" in selectedOption &&
                        "make" in selectedOption &&
                        "model" in selectedOption &&
                        "original_model" in selectedOption
                      ) {
                        //set value for vehicle_details.vehicle_name
                        setValue(
                          "vehicle_details.vehicle_name",
                          selectedOption
                        );
                        //clear vehicle_details.vehicle_name for vehicle_details.company
                        clearErrors("vehicle_details.vehicle_name");
                      }
                    }}
                    isDisabled={!watch("vehicle_details.company")}
                    isError={fieldState?.error?.message || ""}
                  />
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Step2;
