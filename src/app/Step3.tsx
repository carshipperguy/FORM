import React, { useRef, createRef, useEffect, useState } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  UseFormWatch,
  FieldErrors,
  UseFormSetError,
  FieldValues,
  Control,
  UseFormClearErrors,
} from "react-hook-form";
import InputMask from "react-input-mask";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { format, compareAsc } from "date-fns";

import { IFormInput } from "./page";
import Comboboxes from "./components/comboboxes";
import Menus from "./components/menus";

const Step3 = ({
  errors,
  register,
  watch,
  setValue,
  setError,
  control,
  clearErrors,
}: {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  setError: UseFormSetError<FieldValues>;
  clearErrors: UseFormClearErrors<FieldValues>;
  control: Control;
}) => {
  // const [phone, setPhone] = useState("");
  const companyRef = createRef<any>();
  const vehicleRef = createRef<any>();
  const [phoneValue, setPhoneValue] = useState<any>(null);

  const all_available_dates = [
    { id: 1, name: "As soon as possible" },
    { id: 2, name: "Within 2 weeks" },
    { id: 3, name: "Within 30 days" },
    { id: 4, name: "More than 30 days" },
  ];

  // useEffect(() => {
  //   register("shipment_details.phone", { required: "This is Required Field" });
  // }, []);

  const handleInput = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(value);

    const filterDigits = value.replace(/\D|\s/g, "");

    if (filterDigits.length === 0) {
      setError("shipment_details.phone", {
        type: "custom",
        message: "This is required field",
      });
    }

    //we only set phone value to react hook form if the filter digits length is 11
    if (filterDigits.length === 10) {
      setValue("shipment_details.phone", value);
      clearErrors("shipment_details.phone");
      return;
    }

    if (filterDigits.length >= 1) {
      setValue("shipment_details.phone", value);
      setError("shipment_details.phone", {
        type: "custom",
        message: "Please enter a valid phone number",
      });
    }
  };

  return (
    <div className="border border-slate-200 mt-2">
      <div className="disabled:opacity-40 disabled:cursor-not-allowed rounded-sm text-sm font-normal relative block w-full group items-center justify-start px-2 py-2  active:shadow-none shadow-lg bg-gradient-to-tr from-[#042434] to-[#052f44] border-[#063a54] text-white">
        Shipment Details
      </div>
      <div className="p-2">
        <Controller
          name={"shipment_details.preferred_date"}
          control={control}
          rules={{
            required: "This is required field",
          }}
          render={({ field, fieldState }) => (
            <div>
              <label className="block">
                {/* <span className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']">
                  First available date
                </span> */}
                <DatePicker
                  {...field}
                  onChange={(value) => {
                    const date = format(new Date(value as Date), "MM/dd/yyyy");
                    console.log({ date });
                    field.onChange(date);
                  }}
                  className={`block w-full rounded-sm border ${
                    errors.preferred_date
                      ? "border-red-400"
                      : "border-slate-300"
                  }  bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:${
                    errors.preferred_date
                      ? "border-red-400"
                      : "border-[#042434]"
                  }  focus:outline-none sm:text-sm h-[38px] mt-1`}
                  format="MM-dd-yyyy"
                  yearPlaceholder="YY"
                  monthPlaceholder="MM"
                  dayPlaceholder="DD"
                />
              </label>
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {fieldState?.error?.message}
              </p>
            </div>
          )}
        />

        {watch("shipment_details.preferred_date") && (
          <>
            <Controller
              name={"shipment_details.name"}
              control={control}
              rules={{
                required: "This is required field",
                pattern: {
                  value: /^\D|[a-z]|[A-Z]+$/g,
                  message: "Please enter a valid name",
                },
              }}
              render={({ field, fieldState }) => (
                <div className="mt-2">
                  <label className="block">
                    {/* <span className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']">
                      {" "}
                      Name{" "}
                    </span> */}
                    <input
                      type="text"
                      className={`mt-1 block w-full rounded-sm border ${
                        fieldState?.error?.message
                          ? "border-red-400"
                          : "border-slate-300"
                      } bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none sm:text-sm`}
                      placeholder="Name"
                      {...field}
                    />
                  </label>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {fieldState?.error?.message}
                  </p>
                </div>
              )}
            />

            <Controller
              name={"shipment_details.email"}
              control={control}
              rules={{
                required: "This is required field",
                pattern: {
                  value:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: "Please enter a valid email",
                },
              }}
              render={({ field, fieldState }) => (
                <div className="mt-2">
                  <label className="block">
                    {/* <span className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']">
                      {" "}
                      Email{" "}
                    </span> */}
                    <input
                      type="email"
                      className={`mt-1 block w-full rounded-sm border ${
                        fieldState?.error?.message
                          ? "border-red-400"
                          : "border-slate-300"
                      }  bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none  sm:text-sm`}
                      placeholder="Email"
                      {...field}
                    />
                  </label>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {fieldState?.error?.message}
                  </p>
                </div>
              )}
            />

            <Controller
              name={"shipment_details.phone"}
              control={control}
              rules={{
                required: "This is required field",
                validate: {
                  atLeastTen: (value) => {
                    const val = value.replace(/\D|\s/g, "");
                    if (val.length >= 1 && val.length < 10)
                      return "Please enter a valid phone number";
                  },
                },
              }}
              render={({ field, fieldState }) => (
                <div className="mt-2">
                  <label className="block">
                    {/* <span className="block text-sm font-medium text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*']">
                      Phone
                    </span> */}
                    <InputMask
                      mask="(999) 999-9999"
                      {...field}
                      onChange={handleInput}
                      placeholder="Phone"
                      className={`mt-1 block w-full rounded-sm border ${
                        errors.phone ? "border-red-400" : "border-slate-300"
                      }  bg-white px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none  sm:text-sm`}
                    ></InputMask>
                  </label>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {fieldState?.error?.message}
                  </p>
                </div>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Step3;
