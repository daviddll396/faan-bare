import React from "react";
import BookingTabs from "../BookingTabs/BookingTabs";
import Input from "../../reusables/Input/Input";
import ListBox, { type ListBoxOption } from "../../reusables/ListBox/ListBox";
import DatePicker from "../../reusables/DatePicker/DatePicker";
import TimePicker from "../../reusables/TimePicker/TimePicker";
import SolidButton from "../SolidButton/SolidButton";
import "./bookingform.css";

type BookingPassenger = {
  firstName: string;
  lastName: string;
  designation: string;
  gender: string;
  mobile: string;
  specialReq: string;
  airport: string;
  travelDate: string;
  flightNumber: string;
  airportTime: string;
  airline: string;
  destination: string;
};

interface BookingFormProps {
  bookingForm: BookingPassenger;
  fieldErrors: { [key: string]: string | false };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setBookingField: (name: keyof BookingPassenger, value: string) => void;
  onAddPassenger: () => void;
  activeTab: "passenger" | "airport";
  setActiveTab: (id: "passenger" | "airport") => void;
  windowWidth: number;
  /** If false, hide the Add New Passenger button (useful in single-passenger flows) */
  showAddPassenger?: boolean;
  /** Optional form-level error message provided by parent */
  bookingFormError?: string | null;
}

const BookingForm: React.FC<BookingFormProps> = ({
  bookingForm,
  fieldErrors,
  onChange,
  setBookingField,
  onAddPassenger,
  activeTab,
  setActiveTab,
  windowWidth,
  showAddPassenger = true,
  bookingFormError = null,
}) => {
  // Precompute common option lists to ensure selected can find the same objects
  const airlineOptions: ListBoxOption[] = [
    "DELTA",
    "ARIK",
    "AIR PEACE",
    "DANA AIR",
    "IBOM AIR",
    "AZMAN AIR",
    "MAX AIR",
    "ETHIOPIAN AIRLINES",
    "TURKISH AIRLINES",
    "KLM",
    "AIR FRANCE",
  ].map((al, i) => ({ id: i, name: al, value: al }));

  const destinationOptions: ListBoxOption[] = [
    "LAGOS",
    "ABUJA",
    "PORT HARCOURT",
    "KANO",
    "KADUNA",
    "JOS",
    "YOLA",
    "LONDON",
    "DUBAI",
    "DOHA",
    "JOHANNESBURG",
    "ACCRA",
  ].map((d, i) => ({ id: i, name: d, value: d }));

  return (
    <>
      <BookingTabs
        items={[
          { id: "passenger", label: "PASSENGER DETAILS" },
          { id: "airport", label: "AIRPORT DETAILS" },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as "passenger" | "airport")}
      />
      <div className="booking-tab-underline" />

      {activeTab === "passenger" && (
        <>
          {windowWidth > 768 ? (
            <div className="booking-form-fields-row">
              <div className="booking-form-field-col">
                <Input
                  label={
                    <span className="booking-form-label required">
                      First Name
                    </span>
                  }
                  className={`booking-form-input ${
                    fieldErrors.firstName ? "error" : ""
                  }`}
                  name="firstName"
                  value={bookingForm.firstName}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col">
                <Input
                  label={
                    <span className="booking-form-label required">
                      Last Name
                    </span>
                  }
                  className={`booking-form-input ${
                    fieldErrors.lastName ? "error" : ""
                  }`}
                  name="lastName"
                  value={bookingForm.lastName}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col">
                <ListBox
                  label={
                    <span className="booking-form-label required">
                      Designation
                    </span>
                  }
                  options={[
                    { id: "", name: "", value: "" },
                    { id: "mr", name: "Mr.", value: "Mr." },
                    { id: "mrs", name: "Mrs.", value: "Mrs." },
                    { id: "miss", name: "Miss", value: "Miss" },
                    { id: "dr", name: "Dr.", value: "Dr." },
                    { id: "prof", name: "Prof.", value: "Prof." },
                    { id: "chief", name: "Chief", value: "Chief" },
                    { id: "engr", name: "Engr.", value: "Engr." },
                  ]}
                  selected={
                    ([
                      { id: "mr", name: "Mr.", value: "Mr." },
                      { id: "mrs", name: "Mrs.", value: "Mrs." },
                      { id: "miss", name: "Miss", value: "Miss" },
                      { id: "dr", name: "Dr.", value: "Dr." },
                      { id: "prof", name: "Prof.", value: "Prof." },
                      { id: "chief", name: "Chief", value: "Chief" },
                      { id: "engr", name: "Engr.", value: "Engr." },
                    ].find((o) => o.value === bookingForm.designation) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("designation", opt.value)}
                  placeholder="Select designation"
                  className={fieldErrors.designation ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col">
                <ListBox
                  label={
                    <span className="booking-form-label required">Gender</span>
                  }
                  options={[
                    { id: "male", name: "Male", value: "Male" },
                    { id: "female", name: "Female", value: "Female" },
                  ]}
                  selected={
                    ([
                      { id: "male", name: "Male", value: "Male" },
                      { id: "female", name: "Female", value: "Female" },
                    ].find((o) => o.value === bookingForm.gender) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("gender", opt.value)}
                  placeholder="Select gender"
                  className={fieldErrors.gender ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col">
                <Input
                  label={
                    <span className="booking-form-label required">
                      Mobile Number
                    </span>
                  }
                  className={`booking-form-input ${
                    fieldErrors.mobile ? "error" : ""
                  }`}
                  name="mobile"
                  value={bookingForm.mobile}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col">
                <ListBox
                  label={
                    <span className="booking-form-label required">
                      Special Requirement
                    </span>
                  }
                  options={[
                    { id: "", name: "", value: "" },
                    { id: "none", name: "none", value: "none" },
                    {
                      id: "wheelchair",
                      name: "wheelchair",
                      value: "wheelchair",
                    },
                    {
                      id: "assistance",
                      name: "assistance",
                      value: "assistance",
                    },
                  ]}
                  selected={
                    ([
                      { id: "none", name: "none", value: "none" },
                      {
                        id: "wheelchair",
                        name: "wheelchair",
                        value: "wheelchair",
                      },
                      {
                        id: "assistance",
                        name: "assistance",
                        value: "assistance",
                      },
                    ].find((o) => o.value === bookingForm.specialReq) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("specialReq", opt.value)}
                  placeholder="Select requirement"
                  className={fieldErrors.specialReq ? "error" : ""}
                />
              </div>
            </div>
          ) : (
            <div className="booking-form-fields-row-mobile">
              <div className="booking-form-field-col-mobile">
                <Input
                  label={
                    <span className="booking-form-label required">
                      First Name
                    </span>
                  }
                  className={`booking-form-input ${
                    fieldErrors.firstName ? "error" : ""
                  }`}
                  name="firstName"
                  value={bookingForm.firstName}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <Input
                  label={
                    <span className="booking-form-label required">
                      Last Name
                    </span>
                  }
                  className={`booking-form-input ${
                    fieldErrors.lastName ? "error" : ""
                  }`}
                  name="lastName"
                  value={bookingForm.lastName}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <ListBox
                  label={
                    <span className="booking-form-label required">
                      Designation
                    </span>
                  }
                  options={[
                    { id: "mr", name: "Mr.", value: "Mr." },
                    { id: "mrs", name: "Mrs.", value: "Mrs." },
                    { id: "miss", name: "Miss", value: "Miss" },
                    { id: "dr", name: "Dr.", value: "Dr." },
                    { id: "prof", name: "Prof.", value: "Prof." },
                    { id: "chief", name: "Chief", value: "Chief" },
                    { id: "engr", name: "Engr.", value: "Engr." },
                  ]}
                  selected={
                    ([
                      { id: "mr", name: "Mr.", value: "Mr." },
                      { id: "mrs", name: "Mrs.", value: "Mrs." },
                    ].find((o) => o.value === bookingForm.designation) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("designation", opt.value)}
                  placeholder="Select designation"
                  className={fieldErrors.designation ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <ListBox
                  label={
                    <span className="booking-form-label required">Gender</span>
                  }
                  options={[
                    { id: "male", name: "Male", value: "Male" },
                    { id: "female", name: "Female", value: "Female" },
                  ]}
                  selected={
                    ([
                      { id: "male", name: "Male", value: "Male" },
                      { id: "female", name: "Female", value: "Female" },
                    ].find((o) => o.value === bookingForm.gender) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("gender", opt.value)}
                  placeholder="Select gender"
                  className={fieldErrors.gender ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <Input
                  label="Mobile Number"
                  className={`booking-form-input ${
                    fieldErrors.mobile ? "error" : ""
                  }`}
                  name="mobile"
                  value={bookingForm.mobile}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <ListBox
                  label="Special Requirement"
                  options={[
                    { id: "none", name: "none", value: "none" },
                    {
                      id: "wheelchair",
                      name: "wheelchair",
                      value: "wheelchair",
                    },
                    {
                      id: "assistance",
                      name: "assistance",
                      value: "assistance",
                    },
                  ]}
                  selected={
                    ([
                      { id: "none", name: "none", value: "none" },
                      {
                        id: "wheelchair",
                        name: "wheelchair",
                        value: "wheelchair",
                      },
                      {
                        id: "assistance",
                        name: "assistance",
                        value: "assistance",
                      },
                    ].find((o) => o.value === bookingForm.specialReq) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("specialReq", opt.value)}
                  placeholder="Select requirement"
                  className={fieldErrors.specialReq ? "error" : ""}
                />
              </div>
            </div>
          )}

          {/* Show form-level error above add button handled by parent */}
          {bookingFormError ? (
            <div className="booking-form-error-text">{bookingFormError}</div>
          ) : null}
          {showAddPassenger && (
            <div className="booking-add-passenger-row">
              <SolidButton
                type="button"
                onClick={onAddPassenger}
                size="medium"
                variant="primary"
                rounded={false}
                style={{ marginTop: 12, marginBottom: 0 }}
              >
                + Add New Passenger
              </SolidButton>
            </div>
          )}
        </>
      )}

      {activeTab === "airport" && (
        <>
          {windowWidth > 768 ? (
            <div className="booking-form-fields-row">
              <div className="booking-form-field-col">
                <ListBox
                  label={
                    <span className="booking-form-label required">Airport</span>
                  }
                  options={[
                    { id: "", name: "", value: "" },
                    {
                      id: "mmia",
                      name: "MMIA (Lagos - International)",
                      value: "MMIA",
                    },
                    { id: "abj", name: "ABJ (Abuja)", value: "ABJ" },
                    { id: "phc", name: "PHC (Port Harcourt)", value: "PHC" },
                    { id: "kan", name: "KAN (Kano)", value: "KAN" },
                    { id: "enu", name: "ENU (Enugu)", value: "ENU" },
                  ]}
                  selected={
                    ([
                      {
                        id: "mmia",
                        name: "MMIA (Lagos - International)",
                        value: "MMIA",
                      },
                      { id: "abj", name: "ABJ (Abuja)", value: "ABJ" },
                      { id: "phc", name: "PHC (Port Harcourt)", value: "PHC" },
                      { id: "kan", name: "KAN (Kano)", value: "KAN" },
                      { id: "enu", name: "ENU (Enugu)", value: "ENU" },
                    ].find((o) => o.value === bookingForm.airport) as
                      | ListBoxOption
                      | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("airport", opt.value)}
                  placeholder="Select airport"
                  className={fieldErrors.airport ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col">
                <DatePicker
                  className={`booking-form-input ${
                    fieldErrors.travelDate ? "error" : ""
                  }`}
                  value={bookingForm.travelDate}
                  onChange={(v) => setBookingField("travelDate", v)}
                  label={
                    <span className="booking-form-label required">
                      Travel Date
                    </span>
                  }
                  min={new Date().toISOString().split("T")[0]}
                  error={fieldErrors.travelDate}
                />
              </div>
              <div className="booking-form-field-col">
                <Input
                  label={
                    <span className="booking-form-label required">
                      Flight Number
                    </span>
                  }
                  className={`booking-form-input ${
                    fieldErrors.flightNumber ? "error" : ""
                  }`}
                  name="flightNumber"
                  value={bookingForm.flightNumber}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col">
                <TimePicker
                  className={`booking-form-input ${
                    fieldErrors.airportTime ? "error" : ""
                  }`}
                  value={bookingForm.airportTime}
                  onChange={(
                    opt: { label?: string; value?: string } | undefined
                  ) =>
                    onChange({
                      target: {
                        name: "airportTime",
                        value: opt?.label || opt?.value || "",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>)
                  }
                  placeholder="hh:mm AM/PM"
                  label={
                    <span className="booking-form-label required">
                      Airport Time
                    </span>
                  }
                  step={60}
                  error={fieldErrors.airportTime}
                />
              </div>
              <div className="booking-form-field-col">
                <ListBox
                  label={
                    <span className="booking-form-label required">Airline</span>
                  }
                  options={airlineOptions}
                  selected={
                    (airlineOptions.find(
                      (o) => o.value === bookingForm.airline
                    ) as ListBoxOption | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("airline", opt.value)}
                  placeholder="Select airline"
                  className={fieldErrors.airline ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col">
                <ListBox
                  label={
                    <span className="booking-form-label required">
                      Destination
                    </span>
                  }
                  options={destinationOptions}
                  selected={
                    (destinationOptions.find(
                      (o) => o.value === bookingForm.destination
                    ) as ListBoxOption | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("destination", opt.value)}
                  placeholder="Select destination"
                  className={fieldErrors.destination ? "error" : ""}
                />
              </div>
            </div>
          ) : (
            <div className="booking-form-fields-row-mobile">
              <div className="booking-form-field-col-mobile">
                <ListBox
                  label={
                    <span className="booking-form-label required">Airport</span>
                  }
                  options={[
                    {
                      id: "mmia",
                      name: "MMIA (Lagos - International)",
                      value: "MMIA",
                    },
                    { id: "abj", name: "ABJ (Abuja)", value: "ABJ" },
                    { id: "phc", name: "PHC (Port Harcourt)", value: "PHC" },
                    { id: "kan", name: "KAN (Kano)", value: "KAN" },
                    { id: "enu", name: "ENU (Enugu)", value: "ENU" },
                  ]}
                  selected={
                    ([{ id: 0, name: "", value: "" }].find(
                      (o) => o.value === bookingForm.airport
                    ) as ListBoxOption | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("airport", opt.value)}
                  placeholder="Select airport"
                  className={fieldErrors.airport ? "error" : ""}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <Input
                  className={`booking-form-input ${
                    fieldErrors.travelDate ? "error" : ""
                  }`}
                  name="travelDate"
                  value={bookingForm.travelDate}
                  onChange={onChange}
                  type="date"
                  label={
                    <span className="booking-form-label required">
                      Travel Date
                    </span>
                  }
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <Input
                  label="Flight Number"
                  className={`booking-form-input ${
                    fieldErrors.flightNumber ? "error" : ""
                  }`}
                  name="flightNumber"
                  value={bookingForm.flightNumber}
                  onChange={onChange}
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <Input
                  className={`booking-form-input ${
                    fieldErrors.airportTime ? "error" : ""
                  }`}
                  name="airportTime"
                  value={bookingForm.airportTime}
                  onChange={onChange}
                  type="time"
                  lang="en-US"
                  step={60}
                  placeholder="hh:mm AM/PM"
                  label="Airport Time"
                />
              </div>
              <div className="booking-form-field-col-mobile">
                <ListBox
                  label={
                    <span className="booking-form-label required">Airline</span>
                  }
                  options={airlineOptions.slice(0, 3)}
                  selected={
                    (airlineOptions.find(
                      (o) => o.value === bookingForm.airline
                    ) as ListBoxOption | undefined) ?? null
                  }
                  onChange={(opt) => setBookingField("airline", opt.value)}
                  placeholder="Select airline"
                  className={fieldErrors.airline ? "error" : ""}
                />
              </div>
            </div>
          )}
          {/* Show form-level error above add button handled by parent */}
          {bookingFormError ? (
            <div className="booking-form-error-text">{bookingFormError}</div>
          ) : null}
          {showAddPassenger && (
            <div className="booking-add-passenger-row">
              <SolidButton
                type="button"
                onClick={onAddPassenger}
                size="medium"
                variant="primary"
                rounded={false}
                style={{ marginTop: 12, marginBottom: 0 }}
              >
                + Add New Passenger
              </SolidButton>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default BookingForm;
