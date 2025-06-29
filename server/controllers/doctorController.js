const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");

exports.doctorSignup = catchAsync(async (req, res, next) => {
  // find doctor if already applied
  const doctor = await Doctor.findOne({ email: req.body.email });
  if (doctor)
    return next(
      new AppError(
        "Doctor already applied Please contact your admin clinic",
        400
      )
    );

  const newDoctor = new Doctor({ ...req.body, status: "pending" });
  await newDoctor.save();

  const adminUser = await User.findOne({ isAdmin: true });

  const unseenNotifications = adminUser.unseenNotifications;
  unseenNotifications.push({
    type: "new-doctor-request",
    message: `${newDoctor.fullName} has requested to join as a doctor.`,
    data: {
      doctorId: newDoctor._id,
      name: newDoctor.fullName,
    },
    onClickPath: "/admin/doctors",
  });

  await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });

  res.status(200).send({
    status: true,
    message: "Doctor account applied successfully",
  });
});

exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();

  res.status(200).send({
    status: true,
    message: "All doctors fetched successfully",
    data: doctors,
  });
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ userId: req.params.id });
  if (!doctor) return next(new AppError("Doctor not found", 404));

  res.status(200).send({
    status: true,
    message: "Doctor fetched successfully",
    data: doctor,
  });
});

exports.updateDoctor = catchAsync(async (req, res, next) => {
  const { body } = req.body;

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.params.id },
    body,
    { new: true }
  );

  if (!doctor) return next(new AppError("Doctor not found", 404));

  res.status(200).send({
    status: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
});

exports.getAllApprovedDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find({ status: "approved" });

  res.status(200).send({
    status: true,
    message: "All approved doctors fetched successfully",
    data: doctors,
  });
});

exports.checkBookingAvailability = catchAsync(async (req, res, next) => {
  const { doctorId, date, time } = req.body;
  console.log("Checking booking availability for doctorId:", doctorId);
  // Step 1: Find Doctor and validate
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Step 2: Convert doctor working hours (just time part)
  const doctorStart = moment(doctor.fromTime).utcOffset("+00:00").format("HH:mm");
  const doctorEnd = moment(doctor.toTime).utcOffset("+00:00").format("HH:mm");

  const appointmentTime = moment(time).utcOffset("+00:00").format("HH:mm");

  // Convert strings back to moment objects for comparison
  const doctorStartMoment = moment(doctorStart, "HH:mm");
  const doctorEndMoment = moment(doctorEnd, "HH:mm");
  const appointmentMoment = moment(appointmentTime, "HH:mm");

  // Step 3: Time check
  if (
    appointmentMoment.isBefore(doctorStartMoment) ||
    appointmentMoment.isAfter(doctorEndMoment)
  ) {
    return next(
      new AppError(
        `Please select a time within the doctor's working hours ${doctorStartMoment.format(
          "hh:mm A"
        )} to ${doctorEndMoment.format("hh:mm A")}`,
        400
      )
    );
  }

  // Step 4: Check if time is already booked
  const fromTimeWindow = moment(appointmentMoment).subtract(30, "minutes").toISOString();
  const toTimeWindow = moment(appointmentMoment).add(15, "minutes").toISOString();

  const appointments = await Appointment.find({
    doctorId,
    date: moment(date).format("YYYY-MM-DD"),
    time: {
      $gte: fromTimeWindow,
      $lte: toTimeWindow,
    },
    status: { $ne: "rejected" },
  });

  if (appointments.length > 0) {
    return next(new AppError("Appointment not available", 400));
  }

  // Step 5: Success response
  res.status(200).send({
    status: true,
    message: "Appointment available",
  });
});

exports.doctorAppointments = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ userId: req.params.id });
  if (!doctor) return next(new AppError("Doctor not found", 404));

  const appointments = await Appointment.find({ doctorId: doctor.userId });
  res.status(200).json({
    status: "success",
    message: "Appointments fetched successfully.",
    data: appointments,
  });
});

exports.changeAppointmentStatus = catchAsync(async (req, res, next) => {
  const { appointmentId, status } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
    status,
  });

  if (!appointment) return next(new AppError("Appointment not found", 404));

  // find user and send notification
  const user = await User.findById(appointment.userId);

  const unseenNotifications = user.unseenNotifications;
  unseenNotifications.push({
    type: "appointment-status-changed",
    message: `Your appointment status has been ${status}`,
    data: {
      name: user.name,
    },
    onClickPath: "/appointments",
  });

  await user.save();

  res.status(200).send({
    status: true,
    message: "Appointment status changed successfully",
  });
});

exports.getBookAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({
    doctorId: req.params.id,
    status: "approved",
  });
  res.status(200).send({
    status: true,
    message: "Appointments fetched successfully",
    data: appointments,
  });
});
