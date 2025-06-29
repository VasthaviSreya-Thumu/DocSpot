import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { removeDashAndSpace } from "../../utils";
import { useEffect, useState } from "react";
import axios from "axios";

interface PhoneNumberProps {
  value: string;
  name: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  variant?: "standard" | "outlined" | "filled";
  label?: string;
  formik?: any;
  authScreens?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  showErrorMessage?: boolean;
}

const PrimaryPhoneInput = ({
  value,
  name,
  onChange,
  countryCode,
  variant,
  label,
  formik,
  authScreens,
  disabled,
  readOnly,
  showErrorMessage,
}: PhoneNumberProps) => {
  const [defaultCountry, setDefaultCountry] = useState<string>("pk");
  const [loader, setLoader] = useState(false);

  const getCountry = async () => {
    try {
      setLoader(true);
      const response = await axios.get(
        "https://geolocation-db.com/json/67273a00-5c4b-11ed-9204-d161c2da74ce"
      );

      const apiCountryCode = response?.data?.country_code?.toLowerCase();
      if (apiCountryCode && apiCountryCode.length === 2) {
        setDefaultCountry(apiCountryCode);
      } else {
        setDefaultCountry("pk");
      }
    } catch (error) {
      console.warn("Geolocation country fetch failed:", error);
      setDefaultCountry("pk");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (authScreens) {
      getCountry();
    }
  }, [authScreens]);

  const handleChange = (phone: string) => {
    const processedPhone = removeDashAndSpace(phone);
    if (onChange) {
      onChange(processedPhone);
    } else if (formik) {
      formik.setFieldValue(name, processedPhone);
    }
  };

  const resolvedCountry =
    countryCode && countryCode.length === 2
      ? countryCode.toLowerCase()
      : defaultCountry && defaultCountry.length === 2
      ? defaultCountry
      : "pk"; // fallback country code

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      )}
      <PhoneInput
        country={resolvedCountry}
        value={value}
        onChange={handleChange}
        inputProps={{
          name,
          readOnly,
          disabled: disabled || loader,
          style: {
            cursor: readOnly ? "not-allowed" : "text",
            width: "100%",
            height: "50px",
            fontSize: "16px",
          },
        }}
        containerStyle={{ width: "100%" }}
        buttonStyle={{ border: "none" }}
        specialLabel=""
        disableDropdown={loader}
        isValid={
          showErrorMessage
            ? true
            : !(formik?.touched[name] && formik?.errors[name])
        }
      />
      {!showErrorMessage && formik?.touched[name] && formik?.errors[name] && (
        <div style={{ color: "red", fontSize: "0.8rem", marginTop: 4 }}>
          {formik.errors[name]}
        </div>
      )}
    </div>
  );
};

export default PrimaryPhoneInput;
